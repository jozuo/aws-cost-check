import AWS from 'aws-sdk'
import { INotifyManager } from '../../application/manager/notify-manager-if'
import { Billing } from '../../domain/model/billing'

export class SESNotifyManager implements INotifyManager {
  private readonly ses: AWS.SES
  private readonly config: AWS.SES.Types.ClientConfiguration = {
    endpoint: process.env.NODE_ENV === 'local' ? 'http://localhost:4566' : undefined,
    region: process.env.REGION || 'ap-northeast-1',
  }

  constructor() {
    this.ses = new AWS.SES(this.config)
  }

  public async notifyBilling(billing: Billing, rate: number): Promise<string> {
    const request: AWS.SES.SendEmailRequest = billing.toSendMailRequest(rate)
    const result = await this.ses.sendEmail(request).promise()
    return result.MessageId
  }
}
