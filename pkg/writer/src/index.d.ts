interface Data {
  [key: string]: string | { [key: string]: string }
}

declare type Replacer = (section: string | null, key: string, value: string) => string | undefined

export function write(file: Data, options?: { replacer?: Replacer, minify?: boolean }): string
