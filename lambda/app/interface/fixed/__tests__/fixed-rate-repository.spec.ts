import { FixedRateRepository } from './../fixed-rate-repository'

let instance: FixedRateRepository

beforeEach(() => {
  instance = new FixedRateRepository()
})
describe('getRateJPY()', () => {
  test('結果が取得出来る場合', async () => {
    expect(await instance.getRateJPY()).toBe(109)
  })
})
