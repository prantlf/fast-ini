# fast-ini-parser

Parses INI files to AST with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Small size - 4.47 kB minified, 1.95 kB gzipped, 1.79 kB brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { parseText } from 'fast-ini-parser'

const ini = `
scope = global

[database]
user = dbuser
password = dbpassword
database = use_this_database
`

const ast = parseText(ini)

// Result:
//
// {
//   "type": "File",
//   "body": [...]
// }
```

## API

See also the [TypeScript types].

### parseText(input: string, options?: Options): object

Parses a `text` string with INI file contents to AST.

### parseTokens(input: string, tokens: object[], options?: Options): object

Parses an array of tokens converted from a `text` string with INI file contents to AST.

### tokenize(input: string, options?: Options): object[]

Converts a `text` string with INI file contents to an array of tokens.

### startTokenization(input: string, options?: Options): generator

Returns a generator yielding tokens from a `text` string with INI file contents.

### Options

* `tokens`: if set to `true`, a property `tokes` pointing to an array of tokens will be attached to the AST root (File)
* `comments`: if set to `true`, comments will be included in the extrated tokens
* `whitespace`: if set to `true`, whitespace will be included in the extrated tokens
* `locations`: if set to `true`, node locations (line, column) will be included in the AST
* `ranges`: if set to `true`, node ranges (offset, length) will be included in the AST
* `raw`: if set to `true`, raw names will be included in the AST (names are converted to lower-case)
* `sourceFile`: source file name to use in error messages ("ini" by default)
* `onCreateNode`: a function to be called whenever an AST node has been created
* `onCreateToken`: a function to be called whenever a token has been extracted

onCreateNode: `(node: object): void`

onCreateToken: `(token: object): void`

[Extremely fast]: ../../perf/README.md#parse
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
