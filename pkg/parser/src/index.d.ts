export class ReadError extends Error {
  reason: string
  text: string
  line: number

  constructor(reason: string, text: string, line: number)
}

enum TokenType {
  EOF = 1,
  Whitespace = 2,
  Comment = 4,
  Punctuator = 8,
  Name = 16,
  Value = 32,
}

interface Token {
  type: TokenType
  value: string
  raw?: string
  line: number,
  lineStart: number,
  range: [tokenStart: number, offset: number]
}

interface Node {
  type: string
}

interface Value extends Node {
  type: 'Value'
  value: string
}

interface Name extends Node {
  type: 'Name'
  value: string
  raw?: string
}

interface Key extends Node {
  type: 'Key'
  name: Name
  value: Value
}

interface Section extends Node {
  type: 'Section'
  name: Name
  body: Key[]
}

interface File extends Node {
  type: 'File'
  body: (Key | Section)[]
  tokens?: Token[]
}

interface Options {
  tokens?: boolean
  comments?: boolean
  whitespace?: boolean
  locations?: boolean
  ranges?: boolean
  raw?: boolean
  sourceFile?: string
  onCreateNode: (node: Node) => void
  onCreateToken: (token: Token) => void
}

export const tokenTypes = {
  EOF: 1,
  Whitespace: 2,
  Comment: 4,
  Punctuator: 8,
  Name: 16,
  Value: 32,
  NoData: 6
}

export const defaultOptions = {
  tokens: false,
  comments: false,
  whitespace: false,
  locations: false,
  ranges: false,
  raw: false,
  sourceFile: 'ini'
}

export function parseText(input: string, options?: Options): File

export function parseTokens(input: string, tokens: Token[], options?: Options): File

export function tokenize(input: string, options?: Options): Token[]

export function startTokenization(input: string, options?: Options): Generator<Token>
