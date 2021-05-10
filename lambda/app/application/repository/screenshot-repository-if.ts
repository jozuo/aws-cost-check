export interface IScreenshotRepository {
  persist(buffer: Buffer, suffix?: string): Promise<void>
}
