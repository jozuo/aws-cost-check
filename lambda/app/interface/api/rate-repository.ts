import { CoreOptions } from 'request'
import request from 'request-promise-native'
import { IRateRepository } from '../../application/repository/rate-repository-if'

export class RateRepository implements IRateRepository {
  public async getRateJPY(): Promise<number> {
    const options: CoreOptions = {
      json: true,
    }
    const response = await request.get('https://www.gaitameonline.com/rateaj/getrate', options)
    return this.resolveUSDtoJPY(response)
  }

  private resolveUSDtoJPY(body: any): number {
    return body.quotes
      .filter((data: any) => {
        return data.currencyPairCode === 'USDJPY'
      })
      .map((data: any) => {
        return parseFloat(data.ask)
      })[0]
  }
}
