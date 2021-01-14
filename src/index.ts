import fs from "fs"
import {copySync, moveSync, removeSync} from "fs-extra"
import path from "path"
import {ContractGenerator} from "./ContractGenerator";

export class AppGenerator {
  readonly appPath

  constructor(private appName: string) {
    this.appPath = path.join(process.cwd(), './app')
    this.move()
  }

  fromAbiDirectory(pathLike: string) {
    const p = path.join(__dirname, pathLike)
    if (!fs.existsSync(p)) {
      throw new Error("Not found: " + p)
    }

    if (!fs.lstatSync(p).isDirectory()) {
      throw new Error("Not a directory: " + p)
    }

    const contracts: string[] = []

    let definitions, imports, assignments

    definitions = imports = assignments = ''

    const files = fs.readdirSync(p)
    files.forEach(f => {
      if (!f.endsWith(".json")) {
        console.warn(f + " is not a json file")
        return;
      }
      let name = f.replace(".json", "");

      (new ContractGenerator(path.join(pathLike, f), name, this.appPath)).parse()

      contracts.push(name)

      name = `${name}`
      definitions += `readonly ${name}: ${name}\n`
      imports += `import { ${name} } from "./contracts/${name}"\n`
      assignments += `this.${name} = new ${name}(web3, chainId)\n`
    })

    // generate app path
    !fs.existsSync(this.appPath) && fs.mkdirSync(this.appPath)

    const factory = fs.readFileSync('./stub_app/ContractFactory').toString()
    fs.writeFileSync(path.join(this.appPath, 'ContractFactory.ts'),
      factory
        .replace("####CONTRACT_IMPORTS####", imports)
        .replace("####CONTRACT_DEFINITIONS####", definitions)
        .replace("####CONSTRUCTOR_ASSIGNEMNT####", assignments)
    )

    const index = fs.readFileSync('./stub_app/index').toString()
    fs.writeFileSync(path.join(this.appPath, 'index.ts'),
      index.replace('####APP_NAME####', this.appName)
    )
  }

  move() {
    copySync(path.join(__dirname, '../stub_app'), this.appPath)

    removeSync(path.join(this.appPath, 'EventBase.ts'))
    moveSync(path.join(this.appPath, 'EventBase'), path.join(this.appPath, 'EventBase.ts'))

    removeSync(path.join(this.appPath, 'contracts/BaseContract.ts'))
    moveSync(path.join(this.appPath, 'contracts/BaseContract'), path.join(this.appPath, 'contracts/BaseContract.ts'))

    removeSync(path.join(this.appPath, 'index'))
    removeSync(path.join(this.appPath, 'ContractFactory'))
    // moveSync(path.join(this.appPath, 'index'), path.join(this.appPath, 'index.ts'))
  }

  // TODO: func to clean after errors
}

const appGenerator = new AppGenerator("Stkr")
appGenerator.fromAbiDirectory("../stub_app/contracts/abi")
