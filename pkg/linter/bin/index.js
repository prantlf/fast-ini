#!/usr/bin/env node

import glob from 'tiny-glob'
import { createColors, isColorSupported } from 'colorette'
import { parseText } from 'fast-ini-parser'
import {
  printVersion, matchArgument, slurpStdin, readSource, printError
} from './console.js'

const { argv } = process
let errorsOnly = false
let context = true
let silent = false
let verbose = false
const options = {}
const patterns = []
let bold, white, yellow, green

function usage () {
  console.log(`Checks the syntax of INI files.

${bold(yellow('Usage:'))} ${bold(white('inilint [option...] [pattern ...]'))}

${bold(yellow('Options:'))}
  --[no]-context      show near source as error context. defaults to true
  --[no]-colors       enable colors in the terminal. default is auto
  -e|--errors-only    print only files that failed the check
  -s|--silent         suppress output
  -v|--verbose        print error stacktrace
  -V|--version        print version number
  -h|--help           print usage instructions

If no file name is provided, standard input will be read.

${bold(yellow('Examples:'))}
  echo 'foo = bar' | inilint
  inilint -e foo.ini`)
}

function setColors(enable) {
  ({ bold, white, yellow, green } = createColors(enable && isColorSupported))
}

setColors(true)

for (let i = 2, l = argv.length; i < l; ++i) {
  const arg = argv[i]
  const match = matchArgument(arg)
  if (match) {
    const flag = match[2]
    switch (flag) {
      case 'context':
        context = match[1] !== 'no'
        continue
      case 'colors':
        setColors(match[1] !== 'no')
        continue
      case 'e': case 'errors-only':
        errorsOnly = true
        continue
      case 's': case 'silent':
        silent = true
        continue
      case 'v': case 'verbose':
        verbose = true
        continue
      case 'V': case 'version':
        await printVersion()
        process.exit(0)
        break
      case 'h': case 'help':
        usage()
        process.exit(0)
    }
    if (!silent) console.error(`Unknown option: "${match[0]}".`)
    process.exit(2)
  }
  patterns.push(arg)
}

if (patterns.length) {
  for (const pattern of patterns) {
    const names = await glob(pattern, { filesOnly: true })
    for (const name of names) run(await readSource(name))
  }
} else {
  slurpStdin(run)
}

function run(source) {
  try {
    options.sourceFile = source.name
    parseText(source.code, options)
    if (!silent && !errorsOnly) {
      process.stdout.write(`${source.name} ${bold(green('succeeded'))}\n`)
    }
  } catch (error) {
    if (!silent) printError(process.stdout, source, error, { context, verbose })
    process.exitCode = 1
  }
}
