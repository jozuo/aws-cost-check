import moment from 'moment-timezone'
import { INotifyManager } from '../../../application/manager/notify-manager-if'
import { Billing } from '../../../domain/model/billing'
import { Forecast } from '../../../domain/model/forecast'
import { ServiceCharge } from '../../../domain/model/service-charge'
import { ServiceChargeList } from '../../../domain/model/service-charge-list'
import { Tax } from '../../../domain/model/tax'
import { Total } from '../../../domain/model/total'
import { SESNotifyManager } from '../ses-notify-manager'

describe('SESNotifyManager', () => {
  let manager: INotifyManager
  const forecast = new Forecast('$160.12')
  const total = new Total('$12.34')
  const tax = new Tax('$1.23')
  const date = moment.tz('2019-01-27 00:00:01', 'Asia/Tokyo')
  const serviceCharge = new ServiceCharge('EC2', '$2.34')
  const serviceCharges = new ServiceChargeList([serviceCharge])
  const rate = 109.53
  let billing: Billing

  beforeEach(() => {
    manager = new SESNotifyManager()
  })
  describe('notifyBilling()', () => {
    test('送信が成功する場合', async () => {
      // prepare
      billing = new Billing(forecast, total, tax, serviceCharges, date)
      // execute
      const result = await manager.notifyBilling(billing, rate)
      // verify
      expect(result).toBeDefined()
    })
  })
})
