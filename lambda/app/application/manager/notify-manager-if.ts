import { Billing } from '../../domain/model/billing'

export interface INotifyManager {
  notifyBilling(billing: Billing, rate: number): Promise<string>
}
