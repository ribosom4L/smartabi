import fs from "fs"
import { copySync, moveSync, removeSync } from "fs-extra"
import path from "path"

export class ContractGenerator {
  readonly abi: any
  readonly contractsDir: string
  readonly eventsDir: string
  readonly abiDir: string

  readonly name: string

  readonly typeMap = {
    "uint256": "BN",
    "uint128": "BN",
    "uint64": "BN",
    "uint32": "BN",
    "uint16": "BN",
    "uint8": "BN",
    "bool": "boolean",
    "string": "string",
    "address": "string",
    "bytes32": "string",
    "bytes": "string"
  }

  constructor(abiPath, name: string, to) {
    this.name = name
    this.contractsDir = path.join(to, "contracts")
    this.abiDir = path.join(this.contractsDir, "abi")
    this.eventsDir = path.join(this.contractsDir, "events")
    this.abi = JSON.parse(fs.readFileSync(path.join(__dirname, abiPath), {encoding: "utf-8"}))
    this.checkDirectories()
  }

  private checkDirectories() {
    if (!fs.existsSync(this.contractsDir)) {
      fs.mkdirSync(this.contractsDir, {recursive: true})
    }

    if (!fs.existsSync(this.eventsDir)) {
      fs.mkdirSync(this.eventsDir, {recursive: true})
    }

    if (!fs.existsSync(this.abiDir)) {
      fs.mkdirSync(this.abiDir, {recursive: true})
    }
  }

  public parse() {
    const functions = []
    const eventInterfaces = []
    const eventPast = []
    const eventSubs = []
    const duplicates = {}

    for (const abiElement of this.abi) {
      let inputs, rawInputs
      abiElement.outputs = abiElement.outputs || []
      abiElement.inputs = abiElement.inputs || []

      if (abiElement.inputs) {
        inputs = abiElement.inputs.map((d, i) => {
          return `${d.name || "param_" + i}: ${this.typeMap[d.type]}`
        })
        rawInputs = abiElement.inputs.map((d, i) => {
          return d.name || ("param_" + i)
        })
      }
      else {
      }

      let outputs
      if (abiElement.outputs.length > 0) {
        outputs = abiElement.outputs.length > 1 ? abiElement.outputs.map((d, i) => {
          return `${(d.name || i)}: ${this.typeMap[d.type]}`
        }) : this.typeMap[abiElement.outputs[0].type]
      }
      else {
      }

      let name
      if (duplicates.hasOwnProperty(abiElement.name)) {
        name = abiElement.name + "_" + duplicates[abiElement.name]
        duplicates[abiElement.name]++
      } else {
        name = abiElement.name
        duplicates[abiElement.name] = 1
      }

      if (abiElement.type === 'function') {
        if (abiElement.stateMutability === 'view' || abiElement.stateMutability === 'pure') {
          functions.push(ContractGenerator.generateCallableFunction(name, inputs, outputs, rawInputs))
        } else {
          functions.push(ContractGenerator.generateSendableFunction(name, inputs, rawInputs))
        }
      } else {
        eventInterfaces.push(ContractGenerator.generateEventInterface(abiElement.name, inputs))
        eventPast.push(ContractGenerator.generatePastEventFunction(abiElement.name))
        eventSubs.push(ContractGenerator.generateSubsEventFunction(abiElement.name))
      }
    }

    // ________________________

    const funcStr = functions.join("\n")
    const eventInterfaceStr = eventInterfaces.join("\n")
    const eventPastStr = eventPast.join("\n")
    const eventSubsStr = eventSubs.join("\n")

    const contractStub = fs.readFileSync(path.join(__dirname, "./contract_stub"), {encoding: "utf-8"})

    // write file to contracts dir
    fs.writeFileSync(path.join(this.contractsDir, `${this.name}.ts`),
      contractStub
        .replace(/####FUNCTIONS####/g, funcStr)
        .replace(/####CONTRACT_NAME####/g, this.name)
        .replace(/####PAST_EVENTS####/g, eventPastStr)
        .replace(/####SUBS_EVENTS####/g, eventSubsStr)
        .replace(/####INTERFACES####/g, eventInterfaceStr)
    )

    // write abi to abi dir
    fs.writeFileSync(path.join(this.abiDir, `${this.name}.json`), JSON.stringify(this.abi))
  }

  private static generateCallableFunction(name: string, paramEdited: string[], outputs: string[] | string, params: string[]): string {
    const prm = paramEdited.length > 0 ? `${paramEdited.join(',')}, options?: SendOptions` : 'options?: SendOptions';
    let output = ''
    output = Array.isArray(outputs) ? `{${outputs.join(',')}}` : outputs

    return `async ${name}(${prm}): Promise<${output}> { return this.getContract().methods["${name}"](${params.join(", ")}).call()}`
  }

  private static generateSendableFunction(name: string, paramEdited: string[], params: string[]) {
    const prm = paramEdited.length > 0 ? `${paramEdited.join(',')}, options?: SendOptions` : 'options?: SendOptions';
    return `${name}(${prm}): PromiEvent<Contract> { return this.getContract().methods["${name}"](${params.join(", ")}).send(options)}`
  }

  private static generateEventInterface(name: string, paramEdited: string[]) {
    return `interface I${name} {${paramEdited.join("; ")}}`
  }

  private static generatePastEventFunction(name: string) {
    return `
    async getPast${name}(options: PastEventOptions | {}): Promise<ContractEvent<I${name}>[]> { 
        // @ts-ignore
        return this.contract.getPastEvents("${name}", options)
    }\n`
  }

  private static generateSubsEventFunction(name: string) {
    return `${name}(options: EventOptions | {}): SubscribeEvent<I${name}> { return this.contract.events.${name}(options) }`
  }

}