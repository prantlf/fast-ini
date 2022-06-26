import { isLineTerminator, isName, isWhitespace } from '../../../common/src/detection'
import formatMessage from '../../../common/src/format-message'
import { EOF, Punctuator, Name, Value } from './tokens'
import messages from './messages'

// ============================================================
// Error Handling

let sourceFile // name of the parsed source file
let input      // input text to parse
let offset     // offset of the currently evaluated character in the input text
let lineStart  // offset in the input text where the current line starts
let line       // currently parsed line in the input text (1-based)

// Creates a lexing or parsing error.
//
// Ensures properties offset, like, column and source on the error instance.

function createError (message, code, offset, line, column, length) {
  const error = new SyntaxError(message)
  const properties = {
    code: { writable: true, value: code },
    source: { writable: true, value: sourceFile },
    offset: { writable: true, value: offset },
    line: { writable: true, value: line },
    column: { writable: true, value: column },
    length: { writable: true, value: length }
  }
  return Object.create(error, properties)
}

// Throws an error about an unexpected or invalid token and interrupts
// parsing or tokenizing.
//
// Expects a token, a flag if a warning should be created, a message format
// and optionally parameters for the message.
//
// Example:
//
//   // Say "expected [ near ("
//   throwError(token, "expected %1 near %2", '[', token.value)

function throwError (token, id, ...args) {
  const { code, text } = id
  const message = formatMessage(text, ...args)
  // offset is 0-based, line and column are 1-based
  const errorOffset = token.range[0]
  const errorLine = token.line
  const errorColumn = errorOffset - token.lineStart + 1
  const errorLength = token.range[1] - token.range[0]

  throw createError(message, code, errorOffset, errorLine, errorColumn, errorLength)
}

// Throws an unexpected token error.
//
// The caller should pass either a token object or a symbol string which was
// expected or both. We can also specify a nearby token such as <eof>,
// this will default to the currently active token.
//
// Examples:
//
//   // Say "Unexpected symbol 'end' near '<eof>'"
//   handleUnexpectedToken(token)
//   // Say "expected <name> near '0'"
//   handleUnexpectedToken(token, '<name>')

function handleUnexpectedToken (found, expected) {
  throwError(found, messages.expectedToken, expected, nextToken.value)
}

// ============================================================
// Lexer

// ---------- Token extraction

let length              // the length of the input text to parse
let tokenStart          // offset of the currently parsed token in the input text
let afterLineBreak      // if the current token occurs after a line break
let afterEqualSign      // if the current token occurs before value after a "="

// Scans the input at the current offset and returns a token lexed from it.
// Skips white space, comments, preprocessor directives and the content
// enclosed in the alternative part of the preprocessor condition

function getTokenFromInput () {
  let charCode

  // White space and comments have no semantic meaning, so simply skip ahead
  // while tracking the encountered newlines.
  while (offset < length) {
    charCode = input.charCodeAt(offset)
    switch (charCode) {
      case 32: case 9: case 0xB: case 0xC:
        ++offset
        continue
      case 10: case 13:
        // Count two characters \r\n as one line break
        if (charCode === 13 && input.charCodeAt(offset + 1) === 10) ++offset
        ++line
        lineStart = ++offset
        afterLineBreak = true
        continue
      case 59: // ;
        if (afterLineBreak) {
          scanComment()
          continue
        }
    }
    afterLineBreak = false
    break
  }

  // Memorize the range offset where the token begins.
  tokenStart = offset

  // Inform the caller about the end of the input text
  if (offset >= length) {
    return placeToken({ type: EOF, value: '<eof>' })
  }

  return afterEqualSign ? scanValue() : scanOtherToken(charCode)
}

function scanOtherToken (charCode) {
  switch (charCode) {
    case 91: // [
      return scanPunctuator('[')

    case 93: // ]
      return scanPunctuator(']')

    case 61: // =
      afterEqualSign = true
      return scanPunctuator('=')
  }

  return scanName()
}

// {not white space} [not = or ]]*

function scanName () {
  let whitespace
  if (isName(input.charCodeAt(++offset)))
    for(;;) {
      const charCode = input.charCodeAt(++offset)
      if (isName(charCode)) continue
      if (isWhitespace(charCode)) {
        whitespace = offset
        continue
      }
      break
    }

  if (offset === whitespace + 1) offset = whitespace
  const value = input.slice(tokenStart, offset).toLowerCase()
  return placeToken({ type: Name, value })
}

// [:symbol:]

function scanPunctuator (value) {
  ++offset
  return placeToken({ type: Punctuator, value })
}

// .*

function scanValue () {
  do {
    if (isLineTerminator(input.charCodeAt(offset))) break
    ++offset
  } while (offset < length)
  afterEqualSign = false

  return {
    type: Value,
    value: input.slice(tokenStart, offset),
    line,
    lineStart,
    range: [tokenStart, offset]
  }
}

// ; .*

function scanComment () {
  tokenStart = offset
  ++offset // ;

  while (offset < length) {
    if (isLineTerminator(input.charCodeAt(offset))) break
    ++offset
  }
}

// ---------- Lexing helpers

function placeToken (token) {
  token.line = line
  token.lineStart = lineStart
  token.range = [tokenStart, offset]
  return token
}

// ============================================================
// Parser

let token     // the current token scheduled for processing
let prevToken // the token processed before the current one
let nextToken // the token that will be processed after the current one

// ---------- Reading and checking tokens

let advanceToNextToken // function returning a next token to be processed

function advanceToNextTokenFromInput () {
  prevToken = token
  token = nextToken
  nextToken = getTokenFromInput()
}

// Consumes a token if its value matches the expected one and advance to
// the next one. Once consumed or not, returns the success of the operation.

function consumePunctuator (value) {
  if (token.type === Punctuator && value === token.value) {
    advanceToNextToken()
    return true
  }
  return false
}

// Expects the next token value to match the specified one and advances to
// the next one if it does. If not, throws an exception.

function expectPunctuator (value) {
  if (token.type === Punctuator && value === token.value) advanceToNextToken()
  else throwError(token, messages.expected, value, token.value)
}

// <File> ::= [<Section> | <Key>]*

function readFile () {
  advanceToNextToken() // <bof>
  const file = {}
  let section = file
  while (token.type !== EOF) {
    if (consumePunctuator('[')) {
      const name = readSection()
      file[name] = section = {}
    } else {
      readKey(section)
    }
  }
  return file
}

// <Section> ::= "[" <Name> "]" [<Key>]*

function readSection () {
  const name = parseName()
  expectPunctuator(']')
  return name
}

// <Key> ::= <Name> "=" [<Value>]

function readKey (section) {
  const name = parseName()
  expectPunctuator('=')
  const value = parseValue()
  section[name] = value
}

// <Name> ::= {not white space} [not = or ]]*

function parseName () {
  if (token.type !== Name) handleUnexpectedToken(token, '<name>')
  advanceToNextToken()
  return prevToken.value
}

// <Value> ::= [not line break]*

function parseValue () {
  if (token.type !== Value) handleUnexpectedToken(token, '<value>')
  advanceToNextToken()
  return prevToken.value.trimEnd()
}

// ============================================================
// Public API

// Export the main reader.
//
//   - `tokens` Include lexer tokens in the output object. Defaults to false.
//   - `comments` Include comments. Defaults to false.
//   - `whitespace` Include whitespace. Defaults to false.
//   - `locations` Store location information. Defaults to false.
//   - `ranges` Store the start and end character locations. Defaults to false.
//   - `raw` Store the raw original of section and key names. Defaults to false.
//   - `sourceFile` File name to refer in source locations to. Defaults to "ini".
//   - `onCreateNode` Callback which will be invoked when a parser node is created.
//   - `onCreateToken` Callback which will be invoked when a lexer token is created.
//
// Example:
//
//     import { read } from 'fast-ini-reader'
//     const object = read('answer = 42')

export function read (_input) {
  initialize(_input)

  advanceToNextToken = advanceToNextTokenFromInput
  nextToken = getTokenFromInput()

  return readFile()
}

function initialize (_input) {
  input = _input

  // Rewind the lexer
  offset = 0
  line = 1
  lineStart = 0
  length = input.length
  afterLineBreak = true
  afterEqualSign = false
}
