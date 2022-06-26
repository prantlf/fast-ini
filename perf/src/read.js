import createSuite from './create-suite.js'
import { parseText } from '../../pkg/parser/dist/index.mjs'
import { read } from '../../pkg/reader/dist/index.mjs'
import { parse as readIni } from 'ini'
import { parse as readJsIni } from 'js-ini'
import { Parser as MultiIniReader } from 'multi-ini'
import iniApi from 'ini-api'
import { parseSync as readEzIni } from 'ezini'
import ConfCfgIniReader from 'conf-cfg-ini'
import { ConfigIniParser as ConfigIniReader } from 'config-ini-parser'
import { parseString as readGhostffIni } from '@ghostff/ini_parser'
import PropIniReader from 'prop-ini'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Ini: IniApiReader } = iniApi

const perfDirectory = dirname(fileURLToPath(import.meta.url))
const content = readFileSync(join(perfDirectory, 'test.ini'), 'utf8')

function parseFastIni () {
  parseText(content)
}

function readFastIni () {
  read(content)
}

function parseIni () {
  readIni(content)
}

function parseJsIni () {
  readJsIni(content)
}

function parseMultiIni () {
  const reader = new MultiIniReader()
  const lines = content.split(/\r?\n/)
  reader.parse(lines)
}

function parseIniApi () {
  new IniApiReader(content)
}

function parseEzIni () {
  readEzIni(content)
}

function parseConfCfgIni () {
  const reader = new ConfCfgIniReader()
  reader.options.lineEnding = reader.detectLineEnding(content)
  reader.decode(content)
}

function parseConfigIni () {
  const reader = new ConfigIniReader()
  reader.parse(content)
  // config-ini-parser does not create an object during parsing
  reader.items()
  for (const section of reader.sections()) {
    reader.items(section)
  }
}

function parseGhostffIni () {
  readGhostffIni(content)
}

function parsePropIni () {
  const reader = PropIniReader.createInstance()
  reader.decode({ data: content })
}

createSuite('Parsing ini...')
  .add('with fastIni.parseText', parseFastIni)
  .add('with fastIni.read', readFastIni)
  .add('with ini', parseIni)
  .add('with js-ini', parseJsIni)
  .add('with multi-ini', parseMultiIni)
  .add('with ini-api', parseIniApi)
  .add('with ezini', parseEzIni)
  .add('with conf-cfg-ini', parseConfCfgIni)
  .add('with config-ini-parser', parseConfigIni)
  .add('with @ghostff/ini_parser', parseGhostffIni)
  .add('with prop-ini', parsePropIni)
  .start()
