import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { ServiceCharge } from './service-charge'

export class ServiceChargeList {
  private readonly serviceCharges: ServiceCharge[]

  constructor(serviceCharges: ServiceCharge[]) {
    this.serviceCharges = serviceCharges
  }

  public toRecords(date: string): DocumentClient.WriteRequests {
    return this.serviceCharges.map(serviceCharge => {
      return {
        PutRequest: {
          Item: serviceCharge.toRecord(date),
        },
      }
    })
  }
}
