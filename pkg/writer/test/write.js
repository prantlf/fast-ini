import { strictEqual } from 'assert'
import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { write } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

const tests = readTests('data')

test('supports replacer', () => {
  const replacer = (_section, key, value) => {
    if (key === 'a') return undefined
    if (key === 'b') return 0
    return value
  }
  const text = write({ a: 1, b: 2, c: {} }, { replacer })
  strictEqual(text, 'b = 0\n\n[c]\n')
})

test('supports minifying', () => {
  const text = write({ a: { b: 1 }, c: {} }, { minify: true })
  strictEqual(text, '[a]\nb=1\n[c]\n')
})

for (const { name, content } of tests) {
  const data = JSON.parse(content)
  test(name, async () => {
    const text = write(data)
    await checkSnapshot('writer', 'files', 'ini', name, text)
  })
}
