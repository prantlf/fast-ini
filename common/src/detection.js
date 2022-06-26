export function isLineTerminator(charCode) {
  return charCode === 10 || charCode === 13
}

export function isWhitespace(charCode) {
  return charCode === 32 || charCode === 9
}

export function isName(charCode) {
  return charCode !== 91 && charCode !== 93 && charCode !== 61 &&
    !isWhitespace(charCode) && !isLineTerminator(charCode) && !isNaN(charCode)
}
