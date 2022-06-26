interface Node {
  type: string
}

interface Value extends Node {
  type: 'Value'
  value: string
}

interface Name extends Node {
  type: 'Name'
  value: string
  raw?: string
}

interface Key extends Node {
  type: 'Key'
  name: Name
  value: Value
}

interface Section extends Node {
  type: 'Section'
  name: Name
  body: Key[]
}

interface File extends Node {
  type: 'File'
  body: (Key | Section)[]
  tokens?: Token[]
}

interface Data {
  [key: string]: string | { [key: string]: string }
}

export function decode(file: File): Data
