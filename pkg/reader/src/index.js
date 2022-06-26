const trimText = text => text.length > 30 ? `${text.slice(0, 30)}...` : text

const checkProto = (name, text, line) => {
  if (name === '__proto__') throw new ReadError('Illegal name', text, line)
}

export class ReadError extends Error {
  constructor(reason, text, line) {
    super(`${reason} at line ${line}: "${trimText(text)}"`)
    this.reason = reason
    this.text = text
    this.line = line
  }
}

export function read(text, { reviver } = {}) {
  let line = 0
  const file = {}
  let group = file
  let section

  for (let chunk of text.split(/\r?\n/)) {
    ++line
    chunk = chunk.trim()
    if (!chunk || chunk[0] === ';') continue

    if (chunk[0] === '[') {
      const last = chunk.length - 1
      if (chunk[last] !== ']') throw new ReadError('Unclosed section', chunk, line)

      section = chunk.slice(1, last).trim().toLowerCase()
      checkProto(section, chunk, line)
      file[section] = group = {}
    } else {
      const assign = chunk.indexOf('=')
      if (assign < 0) throw new ReadError('Incomplete key', chunk, line)

      const key = chunk.slice(0, assign).trimEnd().toLowerCase()
      checkProto(key, chunk, line)
      let value = chunk.slice(assign + 1).trimStart()
      if (reviver) {
        value = reviver(section, key, value)
        if (value !== undefined) group[key] = value
      } else {
        group[key] = value
      }
    }
  }

  return file
}
