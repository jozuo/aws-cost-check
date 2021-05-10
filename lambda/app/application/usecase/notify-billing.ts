import { inject, injectable } from 'tsyringe'
import { Billing } from '../../domain/model/billing'
import { INotifyManager } from '../manager/notify-manager-if'
import { IRateRepository } from '../repository/rate-repository-if'

@injectable()
export class NotifyBilling {
  constructor(
    @inject('NotifyManager') private readonly manager: INotifyManager,
    @inject('RateRepository') private readonly repository: IRateRepository,
  ) {}

  public async notifyBilling(billing: Billing): Promise<void> {
    const rate = await this.repository.getRateJPY()
    await this.manager.notifyBilling(billing, rate)
  }
}
