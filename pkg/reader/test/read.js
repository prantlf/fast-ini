import { deepStrictEqual, fail, strictEqual } from 'assert'
import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { read } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

test('fails with unfinished key', () => {
  let data
  try {
    data = read('unfinished012345678901234567890123456789')
  } catch ({ message, reason, text, line }) {
    strictEqual(message, 'Incomplete key at line 1: "unfinished01234567890123456789..."')
    strictEqual(reason, 'Incomplete key')
    strictEqual(text, 'unfinished012345678901234567890123456789')
    strictEqual(line, 1)
  }
  if (data) fail()
})

test('fails with unfinished group', () => {
  let data
  try {
    data = read('[')
  } catch ({ message, reason, text, line }) {
    strictEqual(message, 'Unclosed section at line 1: "["')
    strictEqual(reason, 'Unclosed section')
    strictEqual(text, '[')
    strictEqual(line, 1)
  }
  if (data) fail()
})

test('supports reviver', () => {
  const reviver = (_section, key, value) => {
    if (key === 'a') return undefined
    if (key === 'b') return +value
    return value
  }
  const data = read('a = 1\nb = 2\nc = 3\n', { reviver })
  deepStrictEqual(data, { b: 2, c: '3' })
})

test('protects object prototype', () => {
  let data
  try {
    data = read('[__proto__]')
  } catch ({ message, reason, text, line }) {
    strictEqual(message, 'Illegal name at line 1: "[__proto__]"')
    strictEqual(reason, 'Illegal name')
    strictEqual(text, '[__proto__]')
    strictEqual(line, 1)
  }
  if (data) fail()
})

const tests = readTests('files')

for (const { name, content } of tests) {
  test(name, async () => {
    let fromText
    try {
      fromText = read(content)
    } catch ({ message }) {
      fail(message)
    }
    await checkSnapshot('reader', 'data', 'json', name, fromText)
  })
}
