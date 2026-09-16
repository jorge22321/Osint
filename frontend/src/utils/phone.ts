export const normalizePhone = (value?: string | null) => {
  return (value || '').trim().replace(/[\s()-]/g, '')
}

export const isValidInternationalPhone = (value?: string | null) => {
  const normalized = normalizePhone(value)
  return !normalized || /^\+[1-9]\d{7,14}$/.test(normalized)
}
