# fast-ini-writer

Writes JSON objects to INI files with great performance.

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size - 367 B minified, 263 B gzipped, 235 B brotlied.

**This is currently work in progress.**

## Synopsis

```js
import { writeFile } from 'fs/promises'
import { write } from 'fast-ini-writer'

const file = {
  "scope": "global",
  "database": {
    "user": "dbuser",
    "password": "dbpassword",
    "database": "use_this_database"
  }
}

const text = write(file)
await writeFile('app.ini', text)

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

### write(file: object, options?: Options): string

Writes a `file` JSON object to a string with INI file contents.

Options:

* `replacer`: can replace modify key values with a different text
* `minify`: if set to `true`, all unnecessary whitespace will be omitted

Replacer: `(section: string | null, key: string, value: string): string | undefined`

[Extremely fast]: ../../perf/README.md#format
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[TypeScript types]: ./src/index.d.ts
