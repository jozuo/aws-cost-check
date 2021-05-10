import Lambda from 'aws-lambda'
import puppeteer from 'puppeteer-core'
import 'reflect-metadata'
import { container } from 'tsyringe'
import { GetCurrentBilling } from '../../application/usecase/get-current-billing'
import { NotifyBilling } from '../../application/usecase/notify-billing'
import { RegistBilling } from '../../application/usecase/regist-billing'
import { BillingRepository } from '../aws/billing-repository'
import { ConfigRepository } from '../aws/config-repository'
import { ScreenshotRepository } from '../aws/screenshot-repository'
import { SESNotifyManager } from '../aws/ses-notify-manager'
import { FixedRateRepository } from './../fixed/fixed-rate-repository'

/* eslint-disable-next-line */
const chromium = require('chrome-aws-lambda')
// prettier-ignore-start
container.register('BillingRepository', { useClass: BillingRepository }, { singleton: true })
container.register('ConfigRepository', { useClass: ConfigRepository }, { singleton: true })
container.register('RateRepository', { useClass: FixedRateRepository }, { singleton: true })
container.register('ScreenshotRepository', { useClass: ScreenshotRepository }, { singleton: true })
container.register('NotifyManager', { useClass: SESNotifyManager }, { singleton: true })
// prettier-ignore-end

const handler = async (
  event: Lambda.ScheduledEvent,
  _context: Lambda.Context,
  callback: Lambda.Callback,
): Promise<string> => {
  if (!event.id && !event.source) {
    console.log('DeployCheck Mode')
    process.env.DEPLOY_CHECK = 'true'
  }

  let browser: puppeteer.Browser | null = null
  try {
    browser = await getBrowser()
    const billing = await container.resolve(GetCurrentBilling).execute(await browser.newPage())
    console.log('get current billing completed.')

    await container.resolve(RegistBilling).execute(billing)
    console.log('regist billing completed.')

    await container.resolve(NotifyBilling).notifyBilling(billing)
    console.log('notify billing completed.')
  } catch (err) {
    console.log(err)
    // Scheduleの場合、例外をreturnするだけではエラーとした扱われなかったので
    // callbackにもエラー情報をセット(ScheduleEventの時だけかも)
    callback(err)
    return err
  } finally {
    if (browser) {
      await browser.close()
    }
  }

  return 'finished.'
}

const getBrowser = async (): Promise<puppeteer.Browser> => {
  return puppeteer.launch({
    args: chromium.args,
    defaultViewport: chromium.defaultViewport,
    executablePath: await chromium.executablePath,
    headless: chromium.headless,
  })
}

export { handler }
