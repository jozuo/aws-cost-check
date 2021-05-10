import AWS from 'aws-sdk'
import { SiteInfo } from '../../domain/model/site-info'

export class ConfigRepository {
  private readonly ssm: AWS.SSM
  private readonly config: AWS.SSM.Types.ClientConfiguration = {
    endpoint: process.env.NODE_ENV === 'local' ? 'http://localhost:4566' : undefined,
    region: process.env.REGION || 'ap-northeast-1',
  }
  private readonly paramStoreHierarchy: string

  constructor() {
    this.ssm = new AWS.SSM(this.config)
    this.paramStoreHierarchy = process.env.PARAM_STORE_HIERARCHY || ''
  }

  public async getSiteInfo(): Promise<SiteInfo> {
    const params: AWS.SSM.GetParametersRequest = {
      Names: [
        `${this.paramStoreHierarchy}/MANAGED_CONSOLE_URL`,
        `${this.paramStoreHierarchy}/MANAGED_CONSOLE_USER`,
        `${this.paramStoreHierarchy}/MANAGED_CONSOLE_PASSWORD`,
      ],
      WithDecryption: true,
    }
    const ssmParameters = await this.ssm.getParameters(params).promise()
    const siteUrl = this.getParameter(ssmParameters, `${this.paramStoreHierarchy}/MANAGED_CONSOLE_URL`)
    const userId = this.getParameter(ssmParameters, `${this.paramStoreHierarchy}/MANAGED_CONSOLE_USER`)
    const password = this.getParameter(ssmParameters, `${this.paramStoreHierarchy}/MANAGED_CONSOLE_PASSWORD`)

    return new SiteInfo(siteUrl, userId, password)
  }

  private getParameter(ssmParameters: AWS.SSM.GetParametersResult, name: string): string {
    let value: string | undefined
    if (ssmParameters.Parameters) {
      ssmParameters.Parameters.forEach(parameter => {
        if (parameter.Name === name) {
          value = parameter.Value
        }
      })
    }
    if (!value) {
      throw Error(`ssm parameter [${name}] is not defined.`)
    }
    return value
  }
}
