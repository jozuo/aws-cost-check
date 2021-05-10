import { ServiceChargeList } from '../../domain/model/service-charge-list'
import { Tax } from '../../domain/model/tax'
import { Total } from '../../domain/model/total'
import { Forecast } from './../../domain/model/forecast'

export interface IBillingRepository {
  persistForecast(date: string, forecast: Forecast): Promise<void>
  persistTotal(date: string, total: Total): Promise<void>
  persistTax(date: string, tax: Tax): Promise<void>
  persistServiceCharges(date: string, serviceCharges: ServiceChargeList): Promise<void>
}
