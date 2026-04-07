export const currencyFormatter = new Intl.NumberFormat('ko-KR', {
  style: 'currency',
  currency: 'KRW',
  maximumFractionDigits: 0,
})

export function formatMoney(value) {
  return currencyFormatter.format(Number(value || 0))
}

export function formatMonth(date = new Date()) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
  }).format(date)
}

export function formatDate(dateValue) {
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'numeric',
    day: 'numeric',
  }).format(new Date(dateValue))
}

export function formatFullDate(dateValue) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
  }).format(new Date(dateValue))
}

export function toDateInputValue(date = new Date()) {
  const offset = date.getTimezoneOffset() * 60000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function getMonthKey(date = new Date()) {
  return toDateInputValue(date).slice(0, 7)
}

export function startOfWeek(date = new Date()) {
  const result = new Date(date)
  result.setDate(result.getDate() - result.getDay())
  return result
}

export function endOfWeek(date = new Date()) {
  const result = startOfWeek(date)
  result.setDate(result.getDate() + 6)
  return result
}

export function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function endOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0)
}

export function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

export function buildMonthDays(date) {
  const start = startOfMonth(date)
  const end = endOfMonth(date)
  const days = []

  for (let day = new Date(start); day <= end; day.setDate(day.getDate() + 1)) {
    days.push(new Date(day))
  }

  return days
}
