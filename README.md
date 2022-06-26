# Fast INI File Support

Packages for parsing and formatting INI files with great performance.

Although reading configuration is usually not the time-critical part of the application, sometimes it may be so. For example, when many localisation texts are stored in INI files, loading them may take longer. This package attempts to process INI file contents as fast as possible, while focusing on the [original INI file format].

* [Extremely fast].
* Offers [ES], [CJS] and [UMD] modules.
* Includes TypeScript types.
* No dependencies.
* Tiny size:
  * parser - 4.47 kB minified, 1.95 kB gzipped, 1.79 kB brotlied.
  * reader - 736 B minified, 482 B gzipped, 409 B brotlied.
  * writer - 367 B minified, 263 B gzipped, 235 B brotlied.

See also the [INI file grammar].

## Packages

* [linter] - checks syntax of INI files
* [parser] - parses INI file contents to AST
* [formatter] - formats AST to INI file contents
* [decoder] - decodes AST to JSON object
* [encoder] - encodes JSON object to AST
* [reader] - reads INI file contents to JSON object
* [writer] - writes JSON object to INI file contents

**This is currently work in progress.**

[original INI file format]: https://en.wikipedia.org/wiki/INI_file#Example
[INI file grammar]: ./doc/grammar.md#ini-file-grammar
[Extremely fast]: ./perf/README.md#performance
[CJS]: https://blog.risingstack.com/node-js-at-scale-module-system-commonjs-require/#commonjstotherescue
[UMD]: https://github.com/umdjs/umd#readme
[ES]: https://hacks.mozilla.org/2018/03/es-modules-a-cartoon-deep-dive/#content-head
[linter]: ./pkg/linter/#fast-ini-linter
[parser]: ./pkg/parser/#fast-ini-parser
[formatter]: ./pkg/linter/#fast-ini-formatter
[decoder]: ./pkg/linter/#fast-ini-decoder
[encoder]: ./pkg/linter/#fast-ini-encoder
[reader]: ./pkg/reader/#fast-ini-reader
[writer]: ./pkg/writer/#fast-ini-writer
