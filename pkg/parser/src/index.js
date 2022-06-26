import { isLineTerminator, isName, isWhitespace } from '../../../common/src/detection'
import formatMessage from '../../../common/src/format-message'
import defaultOptions from './default-options'
import * as tokenTypes from './tokens'
import messages from './messages'
import ast from './ast'

export { tokenTypes, defaultOptions }

const { EOF, Punctuator, Name, Value, Whitespace, Comment, NoData } = tokenTypes

// ============================================================
// Error Handling

let sourceFile // name of the parsed source file
let input      // input text to parse
let offset     // offset of the currently evaluated character in the input text
let lineStart  // offset in the input text where the current line starts
let line       // currently parsed line in the input text (1-based)
let tokens     // an array of tokens created since the tokenizing started

// Creates a lexing or parsing error.
//
// Ensures properties offset, like, column and source on the error instance.

function createError(message, code, offset, line, column, length) {
  const error = new SyntaxError(message)
  const properties = {
    code: { writable: true, value: code },
    source: { writable: true, value: sourceFile },
    offset: { writable: true, value: offset },
    line: { writable: true, value: line },
    column: { writable: true, value: column },
    length: { writable: true, value: length },
    tokens: { writable: true, value: tokens }
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

function throwError(token, id, ...args) {
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

function handleUnexpectedToken(found, expected) {
  throwError(found, messages.expectedToken, expected, nextToken.value)
}

// ============================================================
// Lexer

// ---------- Token extraction

let length              // the length of the input text to parse
let tokenStart          // offset of the currently parsed token in the input text
let afterLineBreak      // if the current token occurs after a line break
let afterEqualSign      // if the current token occurs before value after a "="
let includeWhitespace   // if whitespace should be included in tokens for onCreateToken
let onCreateToken       // callback for getting informed about any new token

// Scans the input at the current offset and returns a token lexed from it.
// Skips white space and comments.

function getTokenFromInput() {
  let charCode

  // The beginning of a currently parsed whitespace
  // Remember the end of the previous token for the range computation
  let offsetWhitespace = offset
  let lineStartWhitespace = lineStart
  let lineWhitespace = line

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
          mayNotifyAboutWhiteSpace()
          scanComment(true)
          offsetWhitespace = offset
          lineStartWhitespace = lineStart
          lineWhitespace = line
          continue
        }
    }
    afterLineBreak = false
    break
  }

  mayNotifyAboutWhiteSpace()

  // Memorize the range offset where the token begins.
  tokenStart = offset

  // Inform the caller about the end of the input text
  if (offset >= length) {
    const token = placeToken({ type: EOF, value: '<eof>' })
    if (onCreateToken) onCreateToken(token)
    return token
  }

  if (afterEqualSign) {
    const token = scanValue()
    if (onCreateToken) onCreateToken(token)
    return token
  }

  const token = scanOtherToken(charCode)
  if (onCreateToken) onCreateToken(token)
  return token

  function mayNotifyAboutWhiteSpace() {
    // Notify the caller about a white space
    if (onCreateToken && includeWhitespace && offsetWhitespace < offset) {
      onCreateToken({
        type: Whitespace,
        value: input.slice(offsetWhitespace, offset),
        line: lineWhitespace,
        lineStart: lineStartWhitespace,
        lastLine: line,
        lastLineStart: lineStart,
        range: [offsetWhitespace, offset]
      })
    }
  }
}

function scanOtherToken(charCode) {
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

function scanName() {
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
  const raw = input.slice(tokenStart, offset)
  const value = raw.toLowerCase()
  return placeToken({ type: Name, value, raw: includeRaw ? raw : undefined })
}

// [:symbol:]

function scanPunctuator(value) {
  ++offset
  return placeToken({ type: Punctuator, value })
}

// .*

function scanValue() {
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

let includeComments

// ; .*

function scanComment(notify) {
  tokenStart = offset
  const commentStart = ++offset // ;

  while (offset < length) {
    if (isLineTerminator(input.charCodeAt(offset))) break
    ++offset
  }

  if (notify && onCreateToken && includeComments) {
    onCreateToken({
      type: Comment,
      value: input.slice(commentStart, offset),
      line,
      lineStart,
      range: [tokenStart, offset]
    })
  }
}

// ---------- Lexing helpers

function placeToken(token) {
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

function advanceToNextTokenFromInput() {
  prevToken = token
  token = nextToken
  nextToken = getTokenFromInput()
}

function advanceToNextTokenFromTokens() {
  prevToken = token
  token = nextToken
  nextToken = getTokenFromTokens()
}

// Gets a new token from the input token array instead of the input text.

function getTokenFromTokens() {
  // An array of tokens does nto include an explicit <eof> token
  for (;;) {
    if (offset >= length) return placeToken({ type: EOF, value: '<eof>' })
    const token = tokens[offset++]
    if (token.type & NoData) continue
    return token
  }
}

// Consumes a token if its value matches the expected one and advance to
// the next one. Once consumed or not, returns the success of the operation.

function consumePunctuator(value) {
  if (token.type === Punctuator && value === token.value) {
    advanceToNextToken()
    return true
  }
  return false
}

// Expects the next token value to match the specified one and advances to
// the next one if it does. If not, throws an exception.

function expectPunctuator(value) {
  if (token.type === Punctuator && value === token.value) advanceToNextToken()
  else throwError(token, messages.expected, value, token.value)
}

// ---------- Location tracking

let locationsOrRanges // if locations or ranges should be stored in parsed nodes
let includeLocations  // if locations should be stored in parsed nodes
let includeRanges     // if ranges should be stored in parsed nodes
let onCreateNode      // callback for getting informed about any new parsed node

// Optionally sets the location and range on the parsed node and notifies
// the caller that a new parsed node was created.

function placeNode(node, startToken) {
  if (locationsOrRanges) {
    if (includeLocations) {
      node.loc = {
        start: {
          line: startToken.line,
          column: startToken.range[0] - startToken.lineStart
        },
        end: {
          line: prevToken.line,
          column: prevToken.range[1] - prevToken.lineStart
        }
      }
    }
    if (includeRanges) node.range = [startToken.range[0], prevToken.range[1]]
  }
  if (onCreateNode) onCreateNode(node)
  return node
}

let includeRaw // if the raw names should be included

// <File> ::= [<Section> | <Key>]*

function parseFile() {
  advanceToNextToken() // <bof>
  const startToken = token
  const fileBody = []
  let body = fileBody
  let section
  while (token.type !== EOF) {
    if (consumePunctuator('[')) {
      addLastSection()
      section = preparseSection()
      body = []
    } else {
      body.push(parseKey())
    }
  }
  addLastSection()
  return placeNode(ast.file(fileBody), startToken)

  function addLastSection() {
    if (section) {
      fileBody.push(placeNode(ast.section(section.name, body), section.startToken))
    }
  }
}

// <Section> ::= "[" <Name> "]" [<Key>]*

function preparseSection() {
  const startToken = prevToken
  const name = parseName()
  expectPunctuator(']')
  return { name, startToken }
}

// <Key> ::= <Name> "=" [<Value>]

function parseKey() {
  const startToken = token
  const name = parseName()
  expectPunctuator('=')
  /* c8 ignore next */
  const value = token.type !== EOF ? parseValue() : ''
  return placeNode(ast.key(name, value), startToken)
}

// <Name> ::= {not white space} [not = or ]]*

function parseName() {
  if (token.type !== Name) handleUnexpectedToken(token, '<name>')
  advanceToNextToken()
  const { value, raw } = prevToken
  return placeNode(ast.name(value, raw), prevToken)
}

// <Value> ::= [not line break]*

function parseValue() {
  /* c8 ignore next */
  if (token.type !== Value) handleUnexpectedToken(token, '<value>')
  advanceToNextToken()
  return placeNode(ast.value(prevToken.value.trimEnd()), prevToken)
}

// ============================================================
// Public API

// Export the main parser.
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
//     import { parseText } from 'fast-ini-parser'
//     const file = parseText('answer = 42')

let includeTokens // if an array of tokens should be attached to the parsed AST

export function parseText(_input, _options) {
  initialize(_input, _options)

  if (includeTokens) {
    tokens = []
    onCreateToken = token => tokens.push(token)
  }

  advanceToNextToken = advanceToNextTokenFromInput
  nextToken = getTokenFromInput()

  const file = parseFile()
  if (tokens) {
    // Do not return the last <eof> token
    tokens.splice(tokens.length - 1, 1)
    file.tokens = tokens
  }
  return file
}

export function parseTokens(_input, _tokens, _options) {
  initialize(_input, _options)

  tokens = _tokens
  length = tokens.length

  advanceToNextToken = advanceToNextTokenFromTokens
  nextToken = getTokenFromTokens()

  return parseFile()
}

export function tokenize(_input, _options) {
  initialize(_input, _options)

  const tokens = []
  onCreateToken = token => tokens.push(token)

  while (getTokenFromInput().type !== EOF);
  // Do not return the last <eof> token
  tokens.splice(tokens.length - 1, 1)
  return tokens
}

export function startTokenization(_input, _options) {
  initialize(_input, _options)

  return iterate()
}

function initialize(_input, _options = {}) {
  // Transfer the input options to global variables
  const options = { ...defaultOptions, ..._options };
  ({
    tokens: includeTokens,
    comments: includeComments,
    whitespace: includeWhitespace,
    locations: includeLocations,
    ranges: includeRanges,
    raw: includeRaw,
    sourceFile,
    onCreateNode,
    onCreateToken
  } = options)

  if (includeComments || includeWhitespace) includeTokens = true
  locationsOrRanges = includeLocations || includeRanges

  input = _input

  // Rewind the lexer
  offset = 0
  line = 1
  lineStart = 0
  length = input.length
  afterLineBreak = true
  afterEqualSign = false
}

function * iterate() {
  if (includeTokens) {
    const tokens = []
    onCreateToken = token => tokens.push(token)

    for (;; tokens.length = 0) {
      getTokenFromInput()
      // Insignificant tokens (whitespace and comments) are returned only via the
      // onCreateToken callback before the getTokenFromInput function finishes.
      for (const token of tokens) {
        if (token.type === EOF) return
        yield token
      }
    }
  } else {
    for (;;) {
      const token = getTokenFromInput()
      if (token.type === EOF) break
      yield token
    }
  }
}
