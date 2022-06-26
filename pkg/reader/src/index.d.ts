export class ReadError extends Error {
  reason: string
  text: string
  line: number

  constructor(reason: string, text: string, line: number)
}

interface Data {
  [key: string]: string | { [key: string]: string }
}

declare type Reviver = (section: string | null, key: string, value: string) => string | undefined

export function read(text: string, options?: { reviver?: Reviver }): Data
