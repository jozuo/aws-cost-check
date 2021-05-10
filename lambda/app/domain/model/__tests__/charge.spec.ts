import { Charge } from '../charge'

describe('Charge', () => {
  describe('getFormattedValue()', () => {
    test('整形されていること', () => {
      expect(new Charge('$0.0').getFormattedValue()).toEqual('$0')
      expect(new Charge('$12.34').getFormattedValue()).toEqual('$12.34')
      expect(new Charge('$1234.56').getFormattedValue()).toEqual('$1,234.56')
    })
  })
})
