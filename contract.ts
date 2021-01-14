import { BlockchainNetworkId, IAETH } from '../types'
import { AETHEvents } from '../events'
import AETHAbi from './abi/AETH.json'
import Web3 from 'web3'
import { Contract, SendOptions } from 'web3-eth-contract'
import { PromiEvent } from 'web3-core'
import * as BN from 'bn.js'
import { BaseContract } from './BaseContract'

export class AETHContract extends BaseContract implements IAETH {
  readonly events: AETHEvents
  abi = AETHAbi as any

  constructor(web3: Web3, network: BlockchainNetworkId) {
    super(web3, network)

    this.events = new AETHEvents(this.getContract())
  }

  getName(): string {
    return 'AETH'
  }

  async allowance(owner: string,spender: string, options?: SendOptions): Promise<BN> { return this.getContract().methods["allowance"].call()}
async approve(spender: string,amount: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["approve"].send(options)}
async balanceOf(account: string, options?: SendOptions): Promise<BN> { return this.getContract().methods["balanceOf"].call()}
async decimals(options?: SendOptions): Promise<BN> { return this.getContract().methods["decimals"].call()}
async decreaseAllowance(spender: string,subtractedValue: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["decreaseAllowance"].send(options)}
async increaseAllowance(spender: string,addedValue: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["increaseAllowance"].send(options)}
async owner(options?: SendOptions): Promise<string> { return this.getContract().methods["owner"].call()}
async renounceOwnership(options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["renounceOwnership"].send(options)}
async totalSupply(options?: SendOptions): Promise<BN> { return this.getContract().methods["totalSupply"].call()}
async transfer(recipient: string,amount: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["transfer"].send(options)}
async transferFrom(sender: string,recipient: string,amount: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["transferFrom"].send(options)}
async transferOwnership(newOwner: string, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["transferOwnership"].send(options)}
async initialize(name: string,symbol: string, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["initialize"].send(options)}
async mint(account: string,amount: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["mint"].send(options)}
async updateRatio(newRatio: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["updateRatio"].send(options)}
async ratio(options?: SendOptions): Promise<BN> { return this.getContract().methods["ratio"].call()}
async updateGlobalPoolContract(globalPoolContract: string, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["updateGlobalPoolContract"].send(options)}
async burn(amount: BN, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["burn"].send(options)}
async symbol(options?: SendOptions): Promise<string> { return this.getContract().methods["symbol"].call()}
async name(options?: SendOptions): Promise<string> { return this.getContract().methods["name"].call()}
async updateNameSymbol(symbol: string,name: string, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["updateNameSymbol"].send(options)}
async changeOperator(operator: string, options?: SendOptions): PromiEvent<Contract> { return this.getContract().methods["changeOperator"].send(options)}

}
