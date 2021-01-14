export class ContractEvent {
  private _name: string
  private _inputs: Array<any>

  get inputs(): Array<any> {
    return this._inputs;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
  }

  public addInput() {
    this._inputs.push()
  }
}