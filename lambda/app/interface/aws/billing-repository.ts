import AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ServiceChargeList } from '../../domain/model/service-charge-list'
import { Tax } from '../../domain/model/tax'
import { Total } from '../../domain/model/total'
import { Forecast } from './../../domain/model/forecast'

export class BillingRepository {
  private readonly docClient: DocumentClient
  private readonly config: AWS.DynamoDB.Types.ClientConfiguration = {
    endpoint: process.env.NODE_ENV === 'local' ? 'http://localhost:4566' : undefined,
    region: process.env.REGION || 'ap-northeast-1',
  }
  private readonly table: string

  constructor() {
    this.docClient = new DocumentClient(this.config)
    this.table = process.env.TABLE || ''
  }

  public async persistForecast(date: string, forecast: Forecast): Promise<void> {
    await this.persist(forecast.toRecord(date))
  }

  public async persistTotal(date: string, total: Total): Promise<void> {
    await this.persist(total.toRecord(date))
  }

  public async persistTax(date: string, tax: Tax): Promise<void> {
    await this.persist(tax.toRecord(date))
  }

  public async persistServiceCharges(
    date: string,
    serviceCharges: ServiceChargeList,
  ): Promise<void> {
    const batchSizeMax = 25
    const records = serviceCharges.toRecords(date)

    for (let i = 0; i * batchSizeMax < records.length; i++) {
      const start = i * batchSizeMax
      const end = ((start + batchSizeMax) < records.length) ? (start + batchSizeMax) : records.length
      const subRecords = records.slice(start, end)

      const request: DocumentClient.BatchWriteItemInput = {
        RequestItems: { [this.table]: subRecords },
      }
      await this.docClient.batchWrite(request).promise()
    }
  }

  private async persist(item: DocumentClient.PutItemInputAttributeMap): Promise<void> {
    const request: DocumentClient.PutItemInput = {
      TableName: this.table,
      Item: item,
    }
    await this.docClient.put(request).promise()
  }
}
