import puppeteer from 'puppeteer-core'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { ConfigRepository } from '../../../interface/aws/config-repository'
import { ScreenshotRepository } from '../../../interface/aws/screenshot-repository'
import { GetCurrentBilling } from '../get-current-billing'

describe('GetCurrentBilling', () => {
  let usecase: GetCurrentBilling
  let browser: puppeteer.Browser
  let page: puppeteer.Page

  // prettier-ignore-start
  container.register('ConfigRepository', { useClass: ConfigRepository }, { singleton: true })
  container.register(
    'ScreenshotRepository',
    { useClass: ScreenshotRepository },
    { singleton: true },
  )
  // prettier-ignore-end

  const getBrowser = async (): Promise<puppeteer.Browser> => {
    if (process.env.NODE_ENV === 'local') {
      // --- ローカル開発用(Macのブラウザを利用する場合)
      const params: puppeteer.LaunchOptions = {
        args: ['--lang=ja,en-US,en', '--disable-infobars', '--enable-automation'],
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        headless: false,
      }
      return puppeteer.launch(params)
    }

    // --- 実稼働用(chroniumを利用する場合)
    const chromium = require('chrome-aws-lambda') // eslint-disable-line
    return puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath,
      headless: chromium.headless,
    })
  }

  beforeEach(async () => {
    usecase = container.resolve(GetCurrentBilling)
    browser = await getBrowser()
    page = await browser.newPage()
  })
  afterEach(async () => {
    if (browser) {
      await browser.close()
    }
  })
  describe('execute()', () => {
    test('成功する場合', async () => {
      jest.setTimeout(120000)
      const billing = await usecase.execute(page)
      console.log(JSON.stringify(billing, null, 2))
    })
  })
})
