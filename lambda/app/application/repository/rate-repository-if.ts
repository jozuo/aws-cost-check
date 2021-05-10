export interface IRateRepository {
  getRateJPY(): Promise<number>
}
