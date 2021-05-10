import { IConfigRepository } from '../../../application/repository/config-repository-if'
import { ConfigRepository } from '../config-repository'

describe('ConfigRepository', () => {
  let repository: IConfigRepository

  beforeEach(() => {
    repository = new ConfigRepository()
  })
  describe('getSiteInfo()', () => {
    test('値が取得出来る場合', async () => {
      const siteInfo = await repository.getSiteInfo()
      expect(siteInfo.url).toEqual('https://035012641682.signin.aws.amazon.com/console')
      expect(siteInfo.userId).toBeDefined()
      expect(siteInfo.password).toBeDefined()
    })
  })
})