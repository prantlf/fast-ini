# fast-ini-reader

Reads INI files to JSON objects with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size - 736 B minified, 482 B gzipped, 409 B brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { readFile } from 'fs/promises'
import { read } from 'fast-ini-reader'

// Input:
//
// ; application configuration
// scope = global
//
// [database]
// user = dbuser
// password = dbpassword
// database = use_this_database

const text = await readFile('app.ini', 'utf8')
const file = read(text)

// Result:

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

### read(text: string, options?: Options): object

Reads a JSON object from a `text` string with INI file contents.

Options:

* `reviver`: can change key values to a different text

Reviver: `reviver(section: string | null, key: string, value: string) => string | undefined`

[Extremely fast]: ../../perf/README.md#parse
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
