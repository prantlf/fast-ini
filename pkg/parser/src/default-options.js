// Options can be set either globally on the parser object through
// defaultOptions, or during the parse call.
export default {
  // Include lexer tokens in the output object.
  // Useful for code formatting or partial analysis in case of errors.
  tokens: false,
  // Include comment tokens in the output of parsing or lexing.
  // Useful for code formatting.
  comments: false,
  // Include whitespace tokens in the output of parsing or lexing.
  // Useful for code formatting.
  whitespace: false,
  // Store location information on each parser node as
  // `loc: { start: { line, column }, end: { line, column } }`.
  locations: false,
  // Store the start and end character locations on each parser node as
  // `range: [start, end]`.
  ranges: false,
  // Store the raw original of names.
  // Useful for code formatting and exact string matching.
  raw: false,
  // File name to refer in source locations to.
  sourceFile: 'ini'
}
