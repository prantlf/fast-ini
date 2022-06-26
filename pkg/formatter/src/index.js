// import { Punctuator, Name, Value, Whitespace, Comment } from '../../parser/src/tokens'

// export function formatTokens(tokens, { normalize, prettify, minify, comments } = {}) {
//   let output = ''
//   let afterName, afterAssign, afterSpace

//   const formatName = token => normalize ? token.value : (token.raw || token.value)

//   for (const token of tokens) {
//     let value, space
//     switch (token.type) {
//       case Punctuator:
//         ({ value }) = token
//         if (value === '=') {
//           space = false
//           if (afterName) {
//             if (!minify || prettify) space = !afterSpace
//             afterName = false
//           }
//           output += space ? ` ${value}`: value
//           afterAssign = true
//         } else {
//           output += value === ']' ? `${value}\n` : value
//         }
//         afterSpace = false
//         break
//       case Name:
//         output += formatName(token)
//         afterName = true
//         afterSpace = false
//         break
//       case Value:
//         ({ value }) = token
//         space = false
//         if (afterAssign) {
//           if (!minify || prettify) space = !afterSpace
//           afterAssign = false
//         }
//         output += space ? ` ${value}\n`: `${value}\n`
//         afterSpace = false
//         break
//       case Comment:
//         if (comments) output += `;${token.value}\n`
//         break
//       case Whitespace:
//         if (!prettify && !minify) output += formatName(token)
//         afterSpace = true
//         break
//       }
//   }

//   return output
// }

export function format(file, { normalize, minify } = {}) {
  let output = ''

  const formatName = node => normalize ? node.value : (node.raw || node.value)

  for (let group = file.body, length = group.length, i = 0; i < length;) {
    const node = group[i++]
    let name
    switch (node.type) {
      case 'Section':
        name = formatName(node.name)
        output += !minify && output ? `\n[${name}]\n` : `[${name}]\n`
        group = node.body;
        ({ length } = group)
        i = 0
        break
      case 'Key':
        name = formatName(node.name)
        output += minify ? `${name}=${node.value.value}\n` : `${name} = ${node.value.value}\n`
        break
    }
  }

  return output
}
