import puppeteer from 'puppeteer-core'
import { inject, injectable } from 'tsyringe'
import { Billing } from '../../domain/model/billing'
import { Forecast } from '../../domain/model/forecast'
import { ServiceChargeList } from '../../domain/model/service-charge-list'
import { Tax } from '../../domain/model/tax'
import { Total } from '../../domain/model/total'
import { IConfigRepository } from '../repository/config-repository-if'
import { IScreenshotRepository } from '../repository/screenshot-repository-if'
import { ServiceCharge } from './../../domain/model/service-charge'

@injectable()
export class GetCurrentBilling {
  constructor(
    @inject('ConfigRepository') private readonly configRepository: IConfigRepository,
    @inject('ScreenshotRepository') private readonly screenshotRepository: IScreenshotRepository,
  ) { }

  public async execute(page: puppeteer.Page): Promise<Billing> {
    try {
      // AWSコンソールにサインイン
      await this.signIn(page)

      // 請求ダッシュボードに遷移
      await this.gotoBillingDashboard(page)

      // 予測額の取得
      const forecast = await this.getForecast(page)

      // 請求明細に遷移
      await this.gotoBillStatement(page)

      // 合計額の取得
      const total = await this.getTotal(page)

      // 税額の取得
      const tax = await this.getTax(page)

      // サービス毎費用の取得
      const serviceCharges = await this.getServiceCharges(page)

      return new Billing(forecast, total, tax, serviceCharges)
    } catch (err) {
      await this.screenshot(page, 'error')
      throw err
    }
  }

  private async getForecast(page: puppeteer.Page): Promise<Forecast> {
    const selector = 'svg.recharts-surface g.recharts-label-list text'
    const value = await page.$$eval(selector, elements => {
      return elements
        .filter((_element, index) => index === 2)
        .map(element => element.textContent)
        .reduce(prev => prev)
    })
    return new Forecast(value ?? '')
  }

  private async getServiceCharges(page: puppeteer.Page): Promise<ServiceChargeList> {
    const selector = 'div[data-testid="bill-details-by-service-product"]'
    const results = await page.$$eval(selector, elements => {
      return elements.map(element => {
        const name = element.querySelector('awsui-expandable-section > h3')?.textContent ?? ''
        const value = element.querySelector('span')?.textContent ?? ''
        // `new ServiceCharge(name.trim(), value) すると、ReferenceErrorになるのでマップ形式で返却
        return { name: name?.trim(), value: value }
      })
    })
    return new ServiceChargeList(
      results.map(result => new ServiceCharge(result.name, result.value)),
    )
  }

  private async getTax(page: puppeteer.Page): Promise<Tax> {
    const selector = 'div[ng-repeat="(taxCode, value) in marketplace.taxTypeMap"] > span'
    const value = await page.$eval(selector, element => {
      return element.textContent
    })
    return new Tax(value ?? '')
  }

  private async getTotal(page: puppeteer.Page): Promise<Total> {
    const selector = 'div[data-testid="bill-details-by-marketplace"] > div > span'
    const value = await page.$eval(selector, element => {
      return element.textContent
    })
    return new Total(value ?? '')
  }

  private async gotoBillStatement(page: puppeteer.Page): Promise<void> {
    // 「請求明細」ボタンをクリック
    await page.click('awsui-button[data-testid="bill-details-button"] > a')
    await page.waitForSelector('awsui-button[data-testid="expand-collapse-button"]')
    await this.screenshot(page)
  }

  private async gotoBillingDashboard(page: puppeteer.Page): Promise<void> {
    // 「ユーザー名」リンク → 「請求ダッシュボード」リンクをクリック
    await page.click('#nav-usernameMenu')
    await page.waitForSelector('[data-testid="aws-billing-console"]')
    await page.click('[data-testid="aws-billing-console"]')
    await page.waitForSelector('svg g.recharts-label-list')
    await this.screenshot(page)
  }

  private async signIn(page: puppeteer.Page): Promise<void> {
    const siteInfo = await this.configRepository.getSiteInfo()

    // goto()のオプションで指定できる`waitUntil`では例外が発生したので`waitForNavigation()`を利用
    await Promise.all([page.goto(siteInfo.url), await page.waitForNavigation()])
    await this.screenshot(page)

    // ID, パスワード入力してサインイン
    await page.type('#username', siteInfo.userId)
    await page.type('#password', siteInfo.password)
    await page.click('#signin_button')

    // 「ユーザー名」リンク → 「請求ダッシュボード」が表示されるまで待機
    await page.waitForSelector('#nav-usernameMenu')
    await this.screenshot(page)
  }

  private async screenshot(page: puppeteer.Page, suffix?: string): Promise<void> {
    const buffer = await page.screenshot({ path: undefined, fullPage: true, encoding: 'binary' })
    await this.screenshotRepository.persist(buffer, suffix)
  }
}
