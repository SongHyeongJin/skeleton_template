export function parsePositiveNumber(value) {
  if (value === '' || value === null || value === undefined) return null
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount <= 0) return null
  return amount
}

export function isValidDate(value) {
  return Boolean(value) && !Number.isNaN(new Date(value).getTime())
}
