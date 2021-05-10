import moment from 'moment-timezone'
import { Forecast } from './forecast'
import { ServiceChargeList } from './service-charge-list'
import { Tax } from './tax'
import { Total } from './total'

export class Billing {
  private readonly _forecast: Forecast
  private readonly _total: Total
  private readonly _tax: Tax
  private readonly _serviceCharges: ServiceChargeList
  private readonly _date: moment.Moment

  constructor(
    forecast: Forecast,
    total: Total,
    tax: Tax,
    serviceCharges: ServiceChargeList,
    date?: moment.Moment,
  ) {
    this._forecast = forecast
    this._total = total
    this._tax = tax
    this._serviceCharges = serviceCharges
    this._date = date ?? moment().tz('Asia/Tokyo')
  }

  get date(): string {
    return this._date.tz('Asia/Tokyo').format('YYYY-MM-DD')
  }

  get forecast(): Forecast {
    return this._forecast
  }

  get total(): Total {
    return this._total
  }

  get tax(): Tax {
    return this._tax
  }

  get serviceCharges(): ServiceChargeList {
    return this._serviceCharges
  }

  public toSendMailRequest(rate: number): AWS.SES.SendEmailRequest {
    return {
      Source: 'mori.toru4@exc.epson.co.jp',
      Destination: {
        ToAddresses: this.getToAddresses(),
      },
      Message: {
        Subject: {
          Data: `AWS Cost Information ${this.date}`,
          Charset: 'UTF-8',
        },
        Body: {
          Text: {
            Data: this.getMessage(rate),
          },
        },
      },
    }
  }

  private getMessage(rate: number): string {
    return `Total: ${this.total.getFormattedValue()} (${this.total.getConvertedValue(rate)})
Forecast: ${this.forecast.getFormattedValue()} (${this.forecast.getConvertedValue(rate)})`
  }

  private getToAddresses(): string[] {
    let addresses: string[]
    if (process.env.DEPLOY_CHECK === 'true') {
      addresses = ['jozuo.dev@gmail.com']
    } else {
      const base = process.env.TO_ADDRESSES ?? ''
      addresses = base.split(',').map(address => address.trim())
    }
    console.log(`to addresses: ${JSON.stringify(addresses)}`)
    return addresses
  }
}
