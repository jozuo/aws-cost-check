import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Charge } from './charge'

export class Tax extends Charge {
  public toRecord(date: string): DocumentClient.PutItemInputAttributeMap {
    return super.toRecord('tax', date)
  }
}
