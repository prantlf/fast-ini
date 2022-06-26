import { bold, cyan } from 'colorette'

// Formats an excerpt of the input text around the error location.

export function formatErrorContext(error, input) {
  const { line, column, offset, length } = error
  const firstColumn = Math.max(0, column - 1 - 30)
  const lastColumn = column - 1 + 30
  const lineStart = offset - column + 1
  const lineEnd = findLineEnd(input, offset)
  const errorIndent = column - 1 - firstColumn
  const linePadding = Math.floor(Math.log10(line + 1) + 2)
  const prefix = sliceInputLines(
    input, getPrecedingLines(input, lineStart, 3), firstColumn, lastColumn
  ).map((content, index, lines) => padNum(line - lines.length + index, linePadding) + '\uff5c ' + content)
  const problem = [
    padNum(line, linePadding) + '\uff5c ' +
      input.slice(lineStart + firstColumn, Math.min(lineStart + lastColumn, lineEnd)),
    ' '.repeat(linePadding) + '\uff5c ' +
      ' '.repeat(errorIndent) + '~'.repeat(Math.min(length, lastColumn - column))
  ]
  const suffix = sliceInputLines(
    input, getFollowingLines(input, lineEnd, 3), firstColumn, lastColumn
  ).map((content, index) => padNum(line + index + 1, linePadding) + '\uff5c ' + content)
  return prefix
    .concat(problem)
    .concat(suffix)
    .map(shrinkWhitespace)
    .join('\n')
}

// Emphasizes the token pointed to by the error using a bright colour.

export function coloriseErrorContext(text) {
  let match, replaced
  return text
    .split('\n')
    .map((line, index, lines) => {
      /* c8 ignore next */
      if (replaced) return line
      if (match) {
        replaced = true
        return match[1] + match[2] + bold(cyan(match[3]))
      }
      /* c8 ignore next */
      if (index === lines.length - 1) return line
      match = /^(\s+\S )(\s*)(~+)$/.exec(lines[index + 1])
      if (match) {
        const lineEnd = line.length
        const tokenStart = Math.min(match[1].length + match[2].length, lineEnd)
        const tokenEnd = Math.min(tokenStart + match[3].length, lineEnd)
        line = line.slice(0, tokenStart) +
          bold(cyan(line.slice(tokenStart, tokenEnd))) +
          line.slice(tokenEnd, lineEnd)
        const match2 = /^(\s*)(\d+)/.exec(line)
        const numStart = match2[1].length
        const numEnd = numStart + match2[2].length
        line = line.slice(0, numStart) +
          bold(cyan(line.slice(numStart, numEnd))) +
          line.slice(numEnd, line.length)
      }
      return line
    })
    .join('\n')
}

// Replace tabs and line breaks with spaces, so that a message text does not
// span across multiple lines, or does not take up too much width.

export function shrinkWhitespace(text) {
  return text.replace(/\t|\r?\n/g, ' ').replace(/\r([^\n])/g, ' $1')
}

// Returns an offset of the nearest following line break. If the specified
// offset is exactly at a line break, it will return the offset unchanged.

function findLineEnd(input, offset) {
  const { length } = input
  while (offset < length && !isLineTerminator(input.charCodeAt(offset))) {
    ++offset
  }
  return offset
}

// Returns an offset after the nearest following line break. If the specified
// offset is exactly at a line break, it will return the offset right after it.

function findNextLineStart(input, offset) {
  const { length } = input
  while (offset < length) {
    const charCode = input.charCodeAt(offset++)
    if (isLineTerminator(charCode)) {
      /* c8 ignore next */
      if (charCode === 13 && offset < length && input.charCodeAt(offset) === 10) ++offset
      break
    }
    /* c8 ignore next 2 */
    ++offset
  }
  return offset
}

// Returns an offset of the nearest preceding line break. If the specified
// offset is exactly at a line break, it will continue to an earlier one.

function findPrevLineEnd(input, offset) {
  while (offset > 0) {
    const charCode = input.charCodeAt(--offset)
    if (isLineTerminator(charCode)) {
      /* c8 ignore next */
      if (charCode === 10 && input.charCodeAt(offset - 1) === 13) --offset
      break
    }
  }
  return offset
}

// Returns an offset after the nearest preceding line break. If the specified
// offset is exactly at a line break, it will continue to an earlier one.

function findLineStart(input, offset) {
  while (offset > 0 && !isLineTerminator(input.charCodeAt(offset - 1))) {
    --offset
  }
  return offset
}

// Returns an array of line offsets before the line at the specified offset.
// A line offset is an array of a starting and ending offset of the line.

function getPrecedingLines(input, lineEnd, count) {
  const offsets = []
  let offset;
  for (; ; lineEnd = offset) {
    lineEnd = findPrevLineEnd(input, lineEnd)
    if (lineEnd === 0 || --count === 0) break
    offset = findLineStart(input, lineEnd)
    offsets.push([offset, lineEnd])
  }
  return offsets
}

// Returns an array of line offsets after the line at the specified offset.
// A line offset is an array of a starting and ending offset of the line.

function getFollowingLines(input, offset, count) {
  const { length } = input
  const offsets = []
  let lineEnd
  for (; ; offset = lineEnd) {
    offset = findNextLineStart(input, offset)
    /* c8 ignore next 4 */
    if (offset >= length || --count === 0) break
    lineEnd = findLineEnd(input, offset)
    offsets.push([offset, lineEnd])
  }
  return offsets
}

// Returns an array of lines sliced from the input, each line cut to contain
// only characters between the first and last columns.

function sliceInputLines(input, offsets, firstColumn, lastColumn) {
  return offsets.map(([start, end]) => input.slice(
    Math.min(start + firstColumn, end), Math.min(start + lastColumn, end)))
}

// Pads the number with spaces from the left side to reach the specified length.

function padNum(number, length) {
  number = number.toString()
  return ' '.repeat(Math.max(0, length - number.length)) + number
}

// Checks if the character begins or ends a line break.

function isLineTerminator(charCode) {
  return charCode === 10 || charCode === 13
}
