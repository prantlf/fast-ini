import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { encode } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

const tests = readTests('data')

for (const { name, content } of tests) {
  const data = JSON.parse(content)
  test(name, async () => {
    const ast = encode(data)
    await checkSnapshot('encoder', 'trees', 'json', name, ast)
  })
}
