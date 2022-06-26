# fast-ini-encoder

Encodes JSON objects to INI files with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size - 367 B minified, 263 B gzipped, 235 B brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { encode } from 'fast-ini-encoder'
import { format } from 'fast-ini-formatter'

const file = {
  "scope": "global",
  "database": {
    "user": "dbuser",
    "password": "dbpassword",
    "database": "use_this_database"
  }
}

const ast = encode(file)
await format('app.ini', ast)

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

### encode(file: object): object

Encodes a `file` JSON object to an AST object.

[Extremely fast]: ../../perf/README.md#parse
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
