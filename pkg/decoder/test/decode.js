import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { decode } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

const tests = readTests('trees')

for (const { name, content } of tests) {
  const ast = JSON.parse(content)
  test(name, async () => {
    const json = decode(ast)
    await checkSnapshot('decoder', 'data', 'json', name, json)
  })
}
