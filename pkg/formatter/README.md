# fast-ini-formatter

Formats AST to INI files with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size - reader - 366 B minified, 260 B gzipped, 225 B brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { parseText } from 'fast-ini-parser'
import { format } from 'fast-ini-formatter'

const ini = `
scope = global
[database ]
user= dbuser
password =dbpassword

database=use_this_database
`

const ast = parseText(ini)
const text = format(ast)

// Output:
//
// scope = global
//
// [database]
// user = dbuser
// password = dbpassword
// database = use_this_database
```

## API

See also the [TypeScript types].

### format(file: object, options?: Options): string

Formats an AST object to a string with INI file contents.

Options:

* `normalize`: if set to `true`, all section and key names will be converted to lower-case
* `minify`: if set to `true`, all unnecessary whitespace will be omitted

[Extremely fast]: ../../perf/README.md#format
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
