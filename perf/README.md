# Performance

Comparing performance of several libraries below.

## Parse

Parsing the content to an AST takes longer than reading it to a JSON objects, but it still faster than any other library:

    Parsing ini...
      with fastIni.parseText x 253,035 ops/sec ±0.49% (92 runs sampled)
      with fastIni.read x 374,308 ops/sec ±0.63% (94 runs sampled)
      with ini x 101,302 ops/sec ±0.61% (93 runs sampled)
      with js-ini x 220,479 ops/sec ±0.56% (90 runs sampled)
      with multi-ini x 67,945 ops/sec ±0.59% (93 runs sampled)
      with ini-api x 72,432 ops/sec ±0.61% (91 runs sampled)
      with ezini x 161,482 ops/sec ±0.51% (91 runs sampled)
      with conf-cfg-ini x 178,500 ops/sec ±0.53% (91 runs sampled)
      with config-ini-parser x 209,907 ops/sec ±0.33% (94 runs sampled)
      with @ghostff/ini_parser x 222,549 ops/sec ±0.28% (93 runs sampled)
      with prop-ini x 98,736 ops/sec ±0.43% (93 runs sampled)

## Format

Formatting a JSON object to text is significantly faster than any other library:

    Formatting ini...
      with fastIni.write x 2,910,990 ops/sec ±0.44% (93 runs sampled)
      with ini x 85,152 ops/sec ±0.68% (94 runs sampled)
      with js-ini x 653,504 ops/sec ±0.61% (92 runs sampled)
      with multi-ini x 235,456 ops/sec ±0.59% (92 runs sampled)
      with ini-api x 1,095,557 ops/sec ±0.51% (94 runs sampled)
      with ezini x 845,873 ops/sec ±0.58% (89 runs sampled)
      with conf-cfg-ini x 1,691,712 ops/sec ±0.42% (95 runs sampled)
      with config-ini-parser x 1,271,065 ops/sec ±0.39% (91 runs sampled)
      with prop-ini x 250,358 ops/sec ±0.38% (91 runs sampled)

## Other Libraries

I couldn't get some other libraries working:

* `easy-ini` - failed executing
* `inireader` - failed executing
* `yaip` - failed loading as both ES and CJS
* `ini-data` - failed parsing
* `simple-ini` - failed parsing
