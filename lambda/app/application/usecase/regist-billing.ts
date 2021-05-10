import { inject, injectable } from 'tsyringe'
import { Billing } from '../../domain/model/billing'
import { IBillingRepository } from '../repository/billing-repository-if'

@injectable()
export class RegistBilling {
  constructor(@inject('BillingRepository') private readonly repository: IBillingRepository) {}

  public async execute(billing: Billing): Promise<void> {
    await this.repository.persistTotal(billing.date, billing.total)
    await this.repository.persistTax(billing.date, billing.tax)
    await this.repository.persistServiceCharges(billing.date, billing.serviceCharges)
  }
}
