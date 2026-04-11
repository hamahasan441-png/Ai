import { describe, it, expect, vi } from 'vitest'

vi.mock('../../utils/intl', () => ({
  getRelativeTimeFormat: () => ({
    format: (value: number, unit: string) =>
      `${Math.abs(value)} ${unit}${Math.abs(value) !== 1 ? 's' : ''} ago`,
  }),
  getTimeZone: () => 'EST',
}))

vi.mock('../../utils/truncate', () => ({
  truncate: vi.fn(),
  truncatePathMiddle: vi.fn(),
  truncateStartToWidth: vi.fn(),
  truncateToWidth: vi.fn(),
  truncateToWidthNoEllipsis: vi.fn(),
  wrapText: vi.fn(),
}))

import {
  formatFileSize,
  formatSecondsShort,
  formatDuration,
  formatNumber,
  formatTokens,
} from '../../utils/format'

describe('formatFileSize', () => {
  it('returns bytes for values < 1KB', () => {
    expect(formatFileSize(0)).toBe('0 bytes')
    expect(formatFileSize(500)).toBe('500 bytes')
    expect(formatFileSize(1023)).toBe('1023 bytes')
  })

  it('formats kilobytes', () => {
    expect(formatFileSize(1024)).toBe('1KB')
    expect(formatFileSize(1536)).toBe('1.5KB')
    expect(formatFileSize(10240)).toBe('10KB')
  })

  it('formats megabytes', () => {
    expect(formatFileSize(1048576)).toBe('1MB')
    expect(formatFileSize(1572864)).toBe('1.5MB')
  })

  it('formats gigabytes', () => {
    expect(formatFileSize(1073741824)).toBe('1GB')
    expect(formatFileSize(1610612736)).toBe('1.5GB')
  })

  it('removes trailing .0 from KB', () => {
    expect(formatFileSize(2048)).toBe('2KB')
  })
})

describe('formatSecondsShort', () => {
  it('formats 0ms', () => {
    expect(formatSecondsShort(0)).toBe('0.0s')
  })

  it('formats 1 second', () => {
    expect(formatSecondsShort(1000)).toBe('1.0s')
  })

  it('formats fractional seconds', () => {
    expect(formatSecondsShort(1234)).toBe('1.2s')
    expect(formatSecondsShort(500)).toBe('0.5s')
  })

  it('formats large values', () => {
    expect(formatSecondsShort(60000)).toBe('60.0s')
  })
})

describe('formatDuration', () => {
  it('formats 0 as 0s', () => {
    expect(formatDuration(0)).toBe('0s')
  })

  it('formats sub-1ms as decimal seconds', () => {
    expect(formatDuration(0.5)).toBe('0.0s')
  })

  it('formats seconds', () => {
    expect(formatDuration(5000)).toBe('5s')
    expect(formatDuration(59000)).toBe('59s')
  })

  it('formats minutes and seconds', () => {
    expect(formatDuration(60000)).toBe('1m 0s')
    expect(formatDuration(90000)).toBe('1m 30s')
  })

  it('formats hours, minutes, seconds', () => {
    expect(formatDuration(3600000)).toBe('1h 0m 0s')
    expect(formatDuration(3661000)).toBe('1h 1m 1s')
  })

  it('formats days', () => {
    expect(formatDuration(86400000)).toBe('1d 0h 0m')
  })

  describe('hideTrailingZeros option', () => {
    it('hides trailing zeros for hours', () => {
      expect(formatDuration(3600000, { hideTrailingZeros: true })).toBe('1h')
    })

    it('hides trailing zeros for minutes', () => {
      expect(formatDuration(60000, { hideTrailingZeros: true })).toBe('1m')
    })

    it('hides trailing zeros for days', () => {
      expect(formatDuration(86400000, { hideTrailingZeros: true })).toBe('1d')
    })

    it('keeps non-trailing-zero components', () => {
      expect(formatDuration(90000, { hideTrailingZeros: true })).toBe('1m 30s')
    })
  })

  describe('mostSignificantOnly option', () => {
    it('returns only hours for hour-scale durations', () => {
      expect(formatDuration(3661000, { mostSignificantOnly: true })).toBe('1h')
    })

    it('returns only minutes for minute-scale durations', () => {
      expect(formatDuration(90000, { mostSignificantOnly: true })).toBe('1m')
    })

    it('returns only days for day-scale durations', () => {
      expect(formatDuration(86400000, { mostSignificantOnly: true })).toBe('1d')
    })
  })

  it('handles rounding carry (59.5s → 1m 0s)', () => {
    // 119500ms = 1m 59.5s → rounds to 1m 60s → carries to 2m 0s
    expect(formatDuration(119500)).toBe('2m 0s')
  })
})

describe('formatNumber', () => {
  it('formats small numbers without compact notation', () => {
    expect(formatNumber(0)).toBe('0')
    expect(formatNumber(100)).toBe('100')
    expect(formatNumber(999)).toBe('999')
  })

  it('formats thousands in compact notation', () => {
    expect(formatNumber(1000)).toBe('1.0k')
    expect(formatNumber(1500)).toBe('1.5k')
  })

  it('formats millions in compact notation', () => {
    expect(formatNumber(1000000)).toBe('1.0m')
  })
})

describe('formatTokens', () => {
  it('removes trailing .0 from compact numbers', () => {
    expect(formatTokens(1000)).toBe('1k')
  })

  it('keeps non-.0 decimals', () => {
    expect(formatTokens(1500)).toBe('1.5k')
  })

  it('formats small numbers', () => {
    expect(formatTokens(42)).toBe('42')
  })
})
