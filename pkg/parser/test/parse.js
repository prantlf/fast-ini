import { deepStrictEqual, fail, strictEqual } from 'assert'
import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { parseText, parseTokens, tokenize } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

test('fails with unfinished key', () => {
  let ast
  try {
    ast = parseText('unfinished ')
  } catch ({ message, code, line, column, offset, length }) {
    strictEqual(message, '"=" expected near "<eof>"')
    strictEqual(code, 'E003')
    strictEqual(line, 1)
    strictEqual(column, 12)
    strictEqual(offset, 11)
    strictEqual(length, 0)
  }
  if (ast) fail()
})

test('fails with unfinished section', () => {
  let ast
  try {
    ast = parseText('[')
  } catch ({ message, code, line, column, offset, length }) {
    strictEqual(message, '<name> expected near "<eof>"')
    strictEqual(code, 'E004')
    strictEqual(line, 1)
    strictEqual(column, 2)
    strictEqual(offset, 1)
    strictEqual(length, 0)
  }
  if (ast) fail()
})

test('fails with unfinished key', () => {
  let nodes = 0
  let ast
  try {
    ast = parseText('\r\nunfinished', {
      tokens: true,
      comments: true,
      whitespace: true,
      locations: true,
      ranges: true,
      raw: true,
      sourceFile: `failing.ini`,
      onCreateNode: () => ++nodes
    })
  } catch ({ message, code, line, column, offset, length }) {
    strictEqual(message, '"=" expected near "<eof>"')
    strictEqual(code, 'E003')
    strictEqual(line, 2)
    strictEqual(column, 11)
    strictEqual(offset, 12)
    strictEqual(length, 0)
  }
  if (ast) fail()
  strictEqual(nodes, 1)
})

test('fails with all information', () => {
  let ast
  try {
    ast = parseText('[', {
      tokens: true,
      comments: true,
      whitespace: true,
      locations: true,
      ranges: true,
      raw: true,
      sourceFile: `failing.ini`
    })
  } catch ({ message, code, line, column, offset, length }) {
    strictEqual(message, '<name> expected near "<eof>"')
    strictEqual(code, 'E004')
    strictEqual(line, 1)
    strictEqual(column, 2)
    strictEqual(offset, 1)
    strictEqual(length, 0)
  }
  if (ast) fail()
})

const tests = readTests('files')

for (const { name, content } of tests) {
  test(name, async () => {
    let fromText, fromTokens
    try {
      const options = {
        tokens: true,
        comments: true,
        whitespace: true,
        locations: true,
        ranges: true,
        raw: true,
        sourceFile: `${name}.ini`
      }
      fromText = parseText(content, options)
      const tokens = tokenize(content, options)
      fromTokens = parseTokens(content, tokens, options)
    } catch ({ message, line, column }) {
      fail(`<input>[${line},${column + 1}]: ${message}`)
    }
    strictEqual('File', fromText.type, 'type parsed from text')
    strictEqual('File', fromTokens.type, 'type parsed from tokens')
    await checkSnapshot('parser', 'trees', 'json', name, fromText)
    deepStrictEqual(fromTokens.body, fromText.body, 'parsed from test like from tokens')
  })
}
