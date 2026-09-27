// Number-box parsing rules for the Wave Lab inputs.
// Typing gate: only digits and at most one decimal point are allowed, so
// intermediate states like "1." or "." can exist while typing.
// Commit rules:
// - empty string: keep the current value (user is mid-edit)
// - a decimal with nothing after it ("1.", ".", "0."): 0
// - unparseable: 0
// - otherwise clamp into [min, max]

/** Character gate for the text box: digits plus at most one decimal point. */
export function isTypingAllowed(text) {
  return /^\d*\.?\d*$/.test(text)
}

/** Apply the commit rules and clamp into [min, max]. */
export function parseNumberInput(text, current, min, max) {
  const t = text.trim()
  let num
  if (t === '') {
    num = current
  } else if (t === '.' || /\.$/.test(t)) {
    num = 0
  } else {
    num = parseFloat(t)
    if (Number.isNaN(num)) num = 0
  }
  return Math.min(max, Math.max(min, num))
}
