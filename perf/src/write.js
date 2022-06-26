import createSuite from './create-suite.js'
import { write } from '../../pkg/writer/dist/index.mjs'
import { stringify as writeIni } from 'ini'
import { stringify as writeJsIni } from 'js-ini'
import { Serializer as MultiIniWriter } from 'multi-ini'
import iniApi from 'ini-api'
import { stringifySync as writeEzIni } from 'ezini'
import ConfCfgIniWriter from 'conf-cfg-ini'
import { ConfigIniParser as ConfigIniWriter } from 'config-ini-parser'
import PropIniWriter from 'prop-ini'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Ini: IniApiWriter } = iniApi

const perfDirectory = dirname(fileURLToPath(import.meta.url))
const content = readFileSync(join(perfDirectory, 'test.ini'), 'utf8')
const data = JSON.parse(readFileSync(join(perfDirectory, 'test.json'), 'utf8'))

function formatUltra () {
  write(data)
}

function formatIni () {
  writeIni(data, { whitespace: true })
}

function formatJsIni () {
  writeJsIni(data, { spaceBefore: true, spaceAfter: true })
}

function formatMultiIni () {
  const writer = new MultiIniWriter()
  writer.serialize(data)
}

const iniApiWriter = new IniApiWriter(content)

function formatIniApi () {
  iniApiWriter.stringify(data, { blankLineBeforeSection: true })
}

function formatEzIni () {
  writeEzIni(data)
}

function formatConfCfgIni () {
  const writer = new ConfCfgIniWriter()
  writer.encode(data)
}

const configIniWriter = new ConfigIniWriter()
configIniWriter.parse(content)

function formatConfigIni () {
  configIniWriter.stringify()
}

const propIniWriter = PropIniWriter.createInstance()
propIniWriter.decode({ data: content })

function formatPropIni () {
  propIniWriter.encode()
}

createSuite('Formatting ini...')
  .add('with fastIni.write', formatUltra)
  .add('with ini', formatIni)
  .add('with js-ini', formatJsIni)
  .add('with multi-ini', formatMultiIni)
  .add('with ini-api', formatIniApi)
  .add('with ezini', formatEzIni)
  .add('with conf-cfg-ini', formatConfCfgIni)
  .add('with config-ini-parser', formatConfigIni)
  .add('with prop-ini', formatPropIni)
  .start()
