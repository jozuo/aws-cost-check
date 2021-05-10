import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import moment from 'moment-timezone'

export class Charge {
  private readonly _value: number
  constructor(value: string) {
    this._value = parseFloat(value.replace('$', ''))
  }

  get value(): number {
    return this._value
  }

  public getFormattedValue(): string {
    return `$${this.value.toLocaleString()}`
  }

  public getConvertedValue(rate: number): string {
    return `¥${Math.round(this.value * rate).toLocaleString()}`
  }

  protected toRecord(kind: string, date: string): DocumentClient.PutItemInputAttributeMap {
    
    return {
      kind: kind,
      date: date,
      charge: this.value,
      expiration: moment().tz('Asia/Tokyo').add(1, 'years').unix() // レコードの有効期間は1年
    }
  }
}
