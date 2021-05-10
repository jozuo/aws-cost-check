import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Charge } from './charge'

export class Total extends Charge {
  public toRecord(date: string): DocumentClient.PutItemInputAttributeMap {
    return super.toRecord('total', date)
  }
}
