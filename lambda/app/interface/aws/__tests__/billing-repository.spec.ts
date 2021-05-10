import AWS from 'aws-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { IBillingRepository } from '../../../application/repository/billing-repository-if'
import { Forecast } from '../../../domain/model/forecast'
import { ServiceCharge } from '../../../domain/model/service-charge'
import { ServiceChargeList } from '../../../domain/model/service-charge-list'
import { Tax } from '../../../domain/model/tax'
import { Total } from '../../../domain/model/total'
import { BillingRepository } from '../billing-repository'

const config: AWS.DynamoDB.Types.ClientConfiguration = {
  endpoint: process.env.NODE_ENV === 'local' ? 'http://localhost:4566' : undefined,
  region: 'us-east-1',
}

const SLEEP_SEC = 0.5
const TABLE_NAME = process.env.TABLE || ''

describe('BillingRepository', () => {
  const docClient = new DocumentClient(config)
  let repository: IBillingRepository
  let date: string
  let actual: DocumentClient.GetItemOutput

  beforeEach(async () => {
    repository = new BillingRepository()
    date = '2018-01-19'
    await deleteAll(date)
    await sleep(SLEEP_SEC)
  })
  describe('persistForecast()', () => {
    test('登録が成功する場合', async () => {
      // persist
      const forecast = new Forecast('$456.78')
      await repository.persistForecast(date, forecast)
      // assert
      await sleep(SLEEP_SEC)
      actual = await get(date, 'forecast')
      expect(actual).toBeDefined()
      expect(actual.Item?.date).toEqual(date)
      expect(actual.Item?.kind).toEqual('forecast')
      expect(actual.Item?.charge).toBe(456.78)
      expect(actual.Item?.expiration).toBeDefined()
    })
  })
  describe('persistTotal()', () => {
    test('登録が成功する場合', async () => {
      // persist
      const total = new Total('$123.45')
      await repository.persistTotal(date, total)
      // assert
      await sleep(SLEEP_SEC)
      actual = await get(date, 'total')
      expect(actual).toBeDefined()
      expect(actual.Item?.date).toEqual(date)
      expect(actual.Item?.kind).toEqual('total')
      expect(actual.Item?.charge).toBe(123.45)
      expect(actual.Item?.expiration).toBeDefined()
    })
  })
  describe('persistTax()', () => {
    test('登録が成功する場合', async () => {
      // persist
      const tax = new Tax('$1.89')
      await repository.persistTax(date, tax)
      // assert
      await sleep(SLEEP_SEC)
      actual = await get(date, 'tax')
      expect(actual).toBeDefined()
      expect(actual.Item?.date).toEqual(date)
      expect(actual.Item?.kind).toEqual('tax')
      expect(actual.Item?.charge).toBe(1.89)
      expect(actual.Item?.expiration).toBeDefined()
    })
  })
  describe('persistServiceCharges()', () => {
    test('登録が成功する場合', async () => {
      // prepare
      const list = new ServiceChargeList([
        new ServiceCharge('Elastic Compute Cloud', '$23.23'),
        new ServiceCharge('Lambda', '$3.45'),
        new ServiceCharge('Route 53', '$0.83'),
      ])
      // persist
      await repository.persistServiceCharges(date, list)
      // assert
      await sleep(SLEEP_SEC)
      actual = await get(date, 'Elastic Compute Cloud')
      expect(actual).toBeDefined()
      expect(actual.Item?.charge).toBe(23.23)
      expect(actual.Item?.expiration).toBeDefined()
      actual = await get(date, 'Lambda')
      expect(actual).toBeDefined()
      expect(actual.Item?.charge).toBe(3.45)
      expect(actual.Item?.expiration).toBeDefined()
      actual = await get(date, 'Route 53')
      expect(actual).toBeDefined()
      expect(actual.Item?.charge).toBe(0.83)
      expect(actual.Item?.expiration).toBeDefined()
    })
  })

  const sleep = async (sec: number): Promise<void> => {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve()
      }, sec * 1000)
    })
  }

  const get = async (targetDate: string, kind: string): Promise<DocumentClient.GetItemOutput> => {
    const params: DocumentClient.GetItemInput = {
      TableName: TABLE_NAME,
      Key: {
        date: targetDate,
        kind: kind,
      },
    }
    return docClient.get(params).promise()
  }

  const deleteAll = async (targetDate: string): Promise<void> => {
    const params: DocumentClient.ScanInput = {
      TableName: TABLE_NAME,
    }
    const response = await docClient.scan(params).promise()
    if (response.Items) {
      for (const item of response.Items) {
        if (item.date == targetDate) {
          await deleteSingle(item.date, item.kind)
        }
      }
    }
  }

  const deleteSingle = async (targetDate: string, kind: string): Promise<void> => {
    const params: DocumentClient.DeleteItemInput = {
      TableName: TABLE_NAME,
      Key: {
        date: targetDate,
        kind: kind,
      },
    }
    await docClient.delete(params).promise()
  }
})
