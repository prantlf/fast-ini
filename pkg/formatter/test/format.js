import { strictEqual } from 'assert'
import tehanu from 'tehanu'
import { readTests, checkSnapshot } from '../../../common/test/helpers.js'
import { format } from '../dist/index.mjs'

const test = tehanu(import.meta.url)

const tests = readTests('trees')

const ast = {
  "type": "File",
  "body": [
    {
      "type": "Key",
      "name": {
        "type": "Name",
        "value": "ungrouped",
        "raw": "Ungrouped"
      },
      "value": {
        "type": "Value",
        "value": "42 ungrouped"
      }
    },
    {
      "type": "Section",
      "name": {
        "type": "Name",
        "value": "section",
        "raw": "Section"
      },
      "body": [
        {
          "type": "Key",
          "name": {
            "type": "Name",
            "value": "grouped"
          },
          "value": {
            "type": "Value",
            "value": "42 grouped"
          }
        }
      ]
    }
  ]
}

test('supports normalization', () => {
  const text = format(ast, { normalize: true })
  strictEqual(text, 'ungrouped = 42 ungrouped\n\n[section]\ngrouped = 42 grouped\n')
})

test('supports minifying', () => {
  const text = format(ast, { minify: true })
  strictEqual(text, 'Ungrouped=42 ungrouped\n[Section]\ngrouped=42 grouped\n')
})

for (const { name, content } of tests) {
  const ast = JSON.parse(content)
  test(name, async () => {
    const text = format(ast)
    await checkSnapshot('formatter', 'files', 'ini', name, text)
  })
}
