import { deepStrictEqual } from 'assert'
import { readdirSync, promises, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join, parse } from 'path'
import micromatch from 'micromatch'

const { readFile, writeFile } = promises

const { env } = process
const { FAST_INI_UPDATE: updateSnapshots } = env
const testPattern = env.FAST_INI_TESTS || '*'
const commonTestDirectory = dirname(fileURLToPath(import.meta.url))
const packageDirectory = join(commonTestDirectory, '../../pkg')

function readTestDirectory (directory) {
  const files = readdirSync(directory)
  const tests = []
  for (const file of files) {
    const { name } = parse(file)
    if (!micromatch.isMatch(name, testPattern)) {
      console.log(`  skip ${name}`)
      continue
    }
    tests.push(readTestFile(name, join(directory, file)))
  }
  return tests
}

function readTestFile (name, file) {
  const content = readFileSync(file, 'utf-8')
  return { name, content }
}

export function readTests(type) {
  return readTestDirectory(join(commonTestDirectory, type))
}

export async function checkSnapshot(pkg, method, format, name, actual) {
  const file = join(packageDirectory, `${pkg}/test/${method}/${name}.${format}`)
  const json = format === 'json'
  if (updateSnapshots) {
    if (json) actual = JSON.stringify(actual, undefined, '  ')
    await writeFile(file, actual)
  } else {
    let content = await readFile(file, 'utf-8')
    if (json) content = JSON.parse(content)
    deepStrictEqual(actual, content)
  }
}
