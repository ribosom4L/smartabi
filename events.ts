import { Contract, EventOptions, PastEventOptions } from 'web3-eth-contract'
import BN from "bn.js"

interface IApproval {owner: string; spender: string; value: BN}
interface IOwnershipTransferred {previousOwner: string; newOwner: string}
interface IRatioUpdate {newRatio: BN}
interface ITransfer {from: string; to: string; value: BN}