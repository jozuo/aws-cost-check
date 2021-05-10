import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { Charge } from './charge'

export class Forecast extends Charge {
  public toRecord(date: string): DocumentClient.PutItemInputAttributeMap {
    return super.toRecord('forecast', date)
  }
}
