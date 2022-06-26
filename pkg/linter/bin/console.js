import { readFile } from 'fs/promises'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { bold, white, red } from 'colorette'
import { formatErrorContext, coloriseErrorContext, shrinkWhitespace } from './error-context.js'

export async function printVersion() {
  const pkg = join(dirname(fileURLToPath(import.meta.url)), '../package.json')
  console.log(JSON.parse(await readFile(pkg, 'utf8')).version)
}

export function matchArgument(arg) {
  return /^(?:-|--)(?:(no)-)?([a-zA-Z][-a-zA-Z]*)$/.exec(arg)
}

export function slurpStdin (done) {
  let input = ''
  process.stdin.setEncoding('utf8')
  process.stdin
    .on('data', chunk => (input += chunk))
    .on('end', () => done({ name: 'ini', code: input }))
    .resume()
}

export async function readSource(name) {
  return { name, code: await readFile(name, 'utf8') }
}

export function printError(output, source, error, { context, verbose } = {}) {
  const { message, reason, line, column } = error
  output.write(`${source.name} ${bold(red('failed'))}\n`)
  /* c8 ignore next */
  const location = line ? `:${line}:${column}` : ''
  output.write(bold(white(`${source.name}${location}: `)) +
    bold(red('error: ')) + bold(white(shrinkWhitespace(reason || message))) + '\n')
  if (context) printErrorContext(output, source, error)
  if (verbose) console.log(error.stack)
}

export function printErrorContext (output, source, error) {
  const text = formatErrorContext(error, source.code)
  if (text) output.write(`${coloriseErrorContext(text)}\n`)
}
