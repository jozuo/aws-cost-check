import { IRateRepository } from './../../application/repository/rate-repository-if'

export class FixedRateRepository implements IRateRepository {
  public async getRateJPY(): Promise<number> {
    return Promise.resolve(109)
  }
}
