import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Charge } from './charge'

export class ServiceCharge extends Charge {
  private readonly _name: string
  constructor(name: string, charge: string) {
    super(charge)
    this._name = name
  }

  get name(): string {
    return this._name
  }

  public toRecord(date: string): DocumentClient.PutItemInputAttributeMap {
    return super.toRecord(this._name, date)
  }
}
