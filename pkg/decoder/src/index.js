export function decode(file) {
  const result = {}
  let target = result

  for (let group = file.body, length = group.length, i = 0; i < length;) {
    const node = group[i++]
    switch (node.type) {
      case 'Section':
        result[node.name.value] = target = {}
        group = node.body;
        ({ length } = group)
        i = 0
        break
      case 'Key':
        target[node.name.value] = node.value.value
        break
    }
  }

  return result
}
