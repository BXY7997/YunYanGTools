export interface WalletCheckinCalendarCell {
  token: string
  day: number
  inCurrentMonth: boolean
  isToday: boolean
  signed: boolean
}

export interface WalletCheckinCalendarMonth {
  title: string
  weekdays: readonly string[]
  cells: WalletCheckinCalendarCell[]
}

const weekdays = ["一", "二", "三", "四", "五", "六", "日"] as const

export function formatWalletDateToken(date: Date) {
  return new Intl.DateTimeFormat("sv-SE", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date)
}

export function resolveWalletCheckinReward(streakDays: number) {
  const normalizedStreakDays = Math.max(1, Math.floor(streakDays))
  return 10 + Math.min(6, normalizedStreakDays - 1) * 2
}

function dateTokenOf(year: number, monthIndex: number, day: number) {
  const month = String(monthIndex + 1).padStart(2, "0")
  const date = String(day).padStart(2, "0")
  return `${year}-${month}-${date}`
}

export function buildWalletCheckinCalendarMonth(options: {
  anchorDate?: Date
  signedDateTokens: string[]
}): WalletCheckinCalendarMonth {
  const today = options.anchorDate || new Date()
  const year = today.getFullYear()
  const monthIndex = today.getMonth()
  const firstDay = new Date(year, monthIndex, 1)
  const weekday = firstDay.getDay()
  const mondayBasedOffset = (weekday + 6) % 7
  const daysInCurrentMonth = new Date(year, monthIndex + 1, 0).getDate()
  const daysInPrevMonth = new Date(year, monthIndex, 0).getDate()

  const signedDateSet = new Set(options.signedDateTokens)
  const todayToken = dateTokenOf(year, monthIndex, today.getDate())
  const cells: WalletCheckinCalendarCell[] = []

  for (let i = mondayBasedOffset - 1; i >= 0; i -= 1) {
    const day = daysInPrevMonth - i
    const prevMonthIndex = monthIndex === 0 ? 11 : monthIndex - 1
    const prevYear = monthIndex === 0 ? year - 1 : year
    const token = dateTokenOf(prevYear, prevMonthIndex, day)
    cells.push({
      token,
      day,
      inCurrentMonth: false,
      isToday: token === todayToken,
      signed: signedDateSet.has(token),
    })
  }

  for (let day = 1; day <= daysInCurrentMonth; day += 1) {
    const token = dateTokenOf(year, monthIndex, day)
    cells.push({
      token,
      day,
      inCurrentMonth: true,
      isToday: token === todayToken,
      signed: signedDateSet.has(token),
    })
  }

  const remain = cells.length % 7
  const appendCount = remain === 0 ? 0 : 7 - remain
  for (let day = 1; day <= appendCount; day += 1) {
    const nextMonthIndex = monthIndex === 11 ? 0 : monthIndex + 1
    const nextYear = monthIndex === 11 ? year + 1 : year
    const token = dateTokenOf(nextYear, nextMonthIndex, day)
    cells.push({
      token,
      day,
      inCurrentMonth: false,
      isToday: token === todayToken,
      signed: signedDateSet.has(token),
    })
  }

  return {
    title: `${year}年${String(monthIndex + 1).padStart(2, "0")}月`,
    weekdays,
    cells,
  }
}
