# fast-ini-linter

Checks syntax of INI files with [great performance].

**This is currently work in progress.**

## Usage

    inilint [option...] [pattern ...]

### Options

    --[no]-context      show near source as error context. defaults to true
    --[no]-colors       enable colors in the terminal. default is auto
    -e|--errors-only    print only files that failed the check
    -s|--silent         suppress output
    -v|--verbose        print error stacktrace
    -V|--version        print version number
    -h|--help           print usage instructions

If no file name is provided, standard input will be read.

### Examples

    echo 'foo = bar' | inilint
    inilint -e foo.ini

[great performance]: ../../perf/README.md#parse
