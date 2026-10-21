import { describe, expect, it } from 'vitest'
import { addDays, addMonths, datesInMonth, isValidDate, nowInJst } from '../shared/utils/date'

describe('日本時間の日付', () => {
  it('UTC 15:00 は日本時間の翌日 0:00', () => {
    expect(nowInJst(new Date('2026-10-19T15:00:00Z'))).toEqual({ date: '2026-10-20', time: '00:00' })
    expect(nowInJst(new Date('2026-10-19T14:59:00Z'))).toEqual({ date: '2026-10-19', time: '23:59' })
  })

  it('月・日の繰り上がり', () => {
    expect(addDays('2026-10-31', 1)).toBe('2026-11-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
    expect(datesInMonth('2028-02')).toHaveLength(29)
    expect(isValidDate('2026-02-30')).toBe(false)
  })
})
