import AWS from 'aws-sdk'
import moment from 'moment-timezone'
import { IScreenshotRepository } from '../../application/repository/screenshot-repository-if'

export class ScreenshotRepository implements IScreenshotRepository {
  private readonly s3: AWS.S3
  private readonly config: AWS.S3.ClientConfiguration = {
    endpoint: process.env.NODE_ENV === 'local' ? 'http://localhost:4566' : undefined,
    region: process.env.REGION || 'ap-northeast-1',
  }
  private readonly bucket: string

  constructor() {
    this.s3 = new AWS.S3(this.config)
    this.bucket = process.env.BUCKET || ''
  }

  public async persist(buffer: Buffer, suffix?: string): Promise<void> {
    console.log(JSON.stringify(this.config))
    let name = `${moment()
      .tz('Asia/Tokyo')
      .format('YYYYMMDD/HHmmssSSS')}`
    name += suffix ? `-${suffix}` : ''

    const request: AWS.S3.PutObjectRequest = {
      Bucket: this.bucket,
      Key: `screenshots/${name}.png`,
      Body: buffer,
    }
    try {
      await this.s3.putObject(request).promise()
    } catch (err) {
      console.log(err)
      throw err
    }
  }
}
