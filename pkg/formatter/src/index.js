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
