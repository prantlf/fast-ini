import { readFile, writeFile } from 'fs/promises'
import { load } from 'js-yaml'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { Diagram } from '@prantlf/railroad-diagrams'

const inputDir = dirname(fileURLToPath(import.meta.url))
const outputDir = join(inputDir, '../svg')

const styles = {
  defaultLight: `path {
        stroke-width: 3;
        stroke: black;
        fill: rgba(0,0,0,0);
      }
      text {
        font: bold 14px monospace;
        text-anchor: middle;
        white-space: pre;
        fill: black;
      }
      text.diagram-text {
        font-size: 12px;
      }
      text.diagram-arrow {
        font-size: 16px;
      }
      text.label {
        text-anchor: start;
      }
      text.comment {
        font: italic 12px monospace;
      }
      rect {
        stroke-width: 3;
        stroke: black;
        fill: hsl(180,100%,90%);
      }
      rect[rx] {
        fill: hsl(120,100%,90%);
      }
      rect.group-box {
        stroke: gray;
        stroke-dasharray: 10 5;
        fill: none;
      }
      path.diagram-text {
        stroke-width: 3;
        stroke: black;
        fill: white;
        cursor: help;
      }
      g.diagram-text:hover path.diagram-text {
        fill: #eee;
      }`,
  defaultDark: `path {
        stroke-width: 3;
        stroke: white;
        fill: rgba(255,255,255,0);
      }
      text {
        font: bold 14px monospace;
        text-anchor: middle;
        white-space: pre;
        fill: white;
      }
      text.diagram-text {
        font-size: 12px;
      }
      text.diagram-arrow {
        font-size: 16px;
      }
      text.label {
        text-anchor: start;
      }
      text.comment {
        font: italic 12px monospace;
      }
      rect {
        stroke-width: 3;
        stroke: white;
        fill: hsl(180,100%,15%);
      }
      rect[rx] {
        fill: hsl(120,100%,15%);
      }
      rect.group-box {
        stroke: gray;
        stroke-dasharray: 10 5;
        fill: none;
      }
      path.diagram-text {
        stroke-width: 3;
        stroke: white;
        fill: black;
        cursor: help;
      }
      g.diagram-text:hover path.diagram-text {
        fill: #111;
      }`,
  merryLight: `svg {
        stroke: hsl(205,100%,41%);
      }
      path {
        stroke-width: 2;
        stroke: hsl(30,100%,41%);
        fill: rgba(0,0,0,0);
      }
      text {
        font: 14px monospace;
        text-anchor: middle;
        stroke: black;
      }
      text.label {
        text-anchor: start;
      }
      text.comment {
        font: italic 12px monospace;
      }
      rect {
        stroke-width: 2;
        stroke: hsl(205,100%,41%);
        fill: rgba(0,0,0,0);
      }
      rect[rx] {
        stroke: hsl(140,100%,41%);
      }`,
  merryDark: `svg {
        stroke: hsl(205,100%,41%);
      }
      path {
        stroke-width: 2;
        stroke: hsl(30,100%,41%);
        fill: rgba(0,0,0,0);
      }
      text {
        font: 14px monospace;
        text-anchor: middle;
        stroke: white;
      }
      text.label {
        text-anchor: start;
      }
      text.comment {
        font: italic 12px monospace;
      }
      rect {
        stroke-width: 2;
        stroke: hsl(205,100%,41%);
        fill: rgba(255,255,255,0);
      }
      rect[rx] {
        stroke: hsl(140,100%,41%);
      }`
}

function renderDiagram (name, code) {
  const content = code
    .toString()
    .replace(/(?:<svg)(?: xmlns="http:\/\/www.w3.org\/2000\/svg")?(?: xmlns:xlink="http:\/\/www.w3.org\/1999\/xlink")?(?: class="railroad-diagram")?( width="[.0-9]+" height="[.0-9]+" viewBox="[.0-9]+ [.0-9]+ [.0-9]+ [.0-9]+")>/,
`<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" class="railroad-diagram"$1>
  <defs>
    <style type="text/css"><![CDATA[
      ${styles.defaultLight}
    ]]></style>
  </defs>
`)
  writeFile(join(outputDir, `${name}.svg`), content)
}

async function generateDiagram(name) {
  const text = load(await readFile(join(inputDir, `${name}.yml`), 'utf8'))
  const diagram = Diagram.fromJSON(text)
  renderDiagram(name, diagram)
}

function generateDiagrams(names) {
  for (const name of names) generateDiagram(name)
}

generateDiagrams([
  'file',
  'section',
  'section-name',
  'key',
  'key-name',
  'value',
  'comment',
  'line-break',
  'white-space'
])
