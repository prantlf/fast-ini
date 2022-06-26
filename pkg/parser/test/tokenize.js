import { fail, ok, strictEqual } from 'assert'
import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { startTokenization, tokenize } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

const tests = readTests('files')

test('iterates over data tokens', () => {
  let count = 0
  for (const token of startTokenization('; comment\n\r\nname=value')) {
    ok(token, `${count++}: ${token}`)
  }
  strictEqual(count, 3)
})

test('iterates over all tokens', () => {
  let count = 0
  for (const token of startTokenization('; comment\nname=value', {
    comments: true, whitespace: true
  })) {
    ok(token, `${count++}: ${token}`)
  }
  strictEqual(count, 5)
})

for (const { name, content } of tests) {
  test(name, async () => {
    let tokens
    try {
      tokens = tokenize(content, {
        comments: true,
        whitespace: true,
        locations: true,
        ranges: true,
        raw: true,
        sourceFile: `${name}.ini`
      })
    } catch ({ message, line, column }) {
      fail(`<input>[${line},${column + 1}]: ${message}`)
    }
    await checkSnapshot('parser', 'tokens', 'json', name, tokens)
  })
}
