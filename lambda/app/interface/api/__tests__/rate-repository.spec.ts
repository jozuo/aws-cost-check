import { IRateRepository } from './../../../application/repository/rate-repository-if'
import { RateRepository } from './../rate-repository'

describe('RateRepository', () => {
  let repository: IRateRepository

  beforeEach(() => {
    repository = new RateRepository()
  })

  describe('getRateJPY()', () => {
    test('取得成功の場合', async () => {
      const result = await repository.getRateJPY()
      console.log(result)
      expect(result).toBeDefined()
    })
  })
})
