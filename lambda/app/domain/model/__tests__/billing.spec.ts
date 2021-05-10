import moment from 'moment-timezone'
import { ServiceChargeList } from '../service-charge-list'
import { Billing } from './../billing'
import { Forecast } from './../forecast'
import { ServiceCharge } from './../service-charge'
import { Tax } from './../tax'
import { Total } from './../total'

describe('Billing', () => {
  const forecast = new Forecast('$160.12')
  const total = new Total('$12.34')
  const tax = new Tax('$1.23')
  const serviceCharge = new ServiceCharge('EC2', '$2.34')
  let instance: Billing
  let date: moment.Moment

  describe('date()', () => {
    test('整形されていること', () => {
      // 日付が変わった直後の時間
      date = moment.tz('2019-01-27 00:00:01', 'Asia/Tokyo')
      instance = new Billing(forecast, total, tax, new ServiceChargeList([serviceCharge]), date)
      expect(instance.date).toEqual('2019-01-27')

      // 日付が変わる直前
      date = moment.tz('2019-01-27 23:59:59', 'Asia/Tokyo')
      instance = new Billing(forecast, total, tax, new ServiceChargeList([serviceCharge]), date)
      expect(instance.date).toEqual('2019-01-27')
    })
  })
  describe.only('toSendMailRequest()', () => {
    test('デプロイ後チェックの場合', () => {
      // setup
      process.env.DEPLOY_CHECK = 'true'
      date = moment.tz('2019-01-27 00:00:01', 'Asia/Tokyo')
      instance = new Billing(forecast, total, tax, new ServiceChargeList([serviceCharge]), date)

      // execute
      const result = instance.toSendMailRequest(100)

      // verify
      expect(result.Source).toEqual('mori.toru4@exc.epson.co.jp')
      expect(result.Destination.ToAddresses).toEqual(
        expect.arrayContaining(['jozuo.dev@gmail.com']),
      )
    })
    test('通常処理の場合', () => {
      // setup
      process.env.DEPLOY_CHECK = ''
      date = moment.tz('2019-01-27 00:00:01', 'Asia/Tokyo')
      instance = new Billing(forecast, total, tax, new ServiceChargeList([serviceCharge]), date)
      const addresses = process.env.TO_ADDRESSES ?? ''

      // execute
      const result = instance.toSendMailRequest(100)

      // verify
      expect(result.Source).toEqual('mori.toru4@exc.epson.co.jp')
      expect(result.Destination.ToAddresses).toEqual(
        expect.arrayContaining(addresses.split(',').map(address => address.trim())),
      )
    })
  })
})
