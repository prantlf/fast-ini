# fast-ini-decoder

Decodes AST to a JSON object with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size - reader - 245 B minified, 191 B gzipped, 162 B brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { parseText } from 'fast-ini-parser'
import { decode } from 'fast-ini-decoder'

const ini = `
scope = global

[database]
user = dbuser
password = dbpassword
database = use_this_database
`

const ast = parseText(ini)
const text = decode(ast)

// Result:
//
// {
//   "scope": "global",
//   "database": {
//     "user": "dbuser",
//     "password": "dbpassword",
//     "database": "use_this_database"
//   }
// }
```

## API

See also the [TypeScript types].

### decode(file: object): object

Decodes an AST object to a JSON object with the data.

[Extremely fast]: ../../perf/README.md#format
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
