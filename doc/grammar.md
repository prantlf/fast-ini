# INI File Grammar

This is the grammar of the [original INI file format].

Section and Key names are case-insensitive. Whitespace may appear around every node and and will be trimmed, when parsing the INI file contents.

See also the [AST node declarations].

## Significant Nodes

### File

![File](svg/file.svg)

### Section

![Section](svg/section.svg)

### Section Name

![SectionName](svg/section-name.svg)

### Key

![Key](svg/key.svg)

### Key Name

![KeyName](svg/key-name.svg)

### Value

![Value](svg/value.svg)

## Insignificant Nodes

### Comment

![Comment](svg/comment.svg)

### Line Break

![LineBreak](svg/line-break.svg)

### White Space

![WhiteSpace](svg/white-space.svg)

[original INI file format]: https://en.wikipedia.org/wiki/INI_file#Example
[AST node declarations]: ../pkg/parser/src/index.d.ts#L26
