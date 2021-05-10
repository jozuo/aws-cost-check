export class SiteInfo {
  private readonly _url: string
  private readonly _userId: string
  private readonly _password: string

  constructor(url: string, userId: string, password: string) {
    this._url = url
    this._userId = userId
    this._password = password
  }

  get url(): string {
    return this._url
  }

  get userId(): string {
    return this._userId
  }

  get password(): string {
    return this._password
  }
}
