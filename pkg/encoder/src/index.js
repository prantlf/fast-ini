export function encode(file) {
  const fileBody = []
  const result = { type: 'File', body: fileBody }

  for (const name in file) {
    const value = file[name]
    if (typeof value === 'object') {
      const body = []
      fileBody.push({ type: 'Section', name: { type: 'Name', value: name }, body })
      for (const key in value) {
        body.push({ type: 'Key', name: { type: 'Name', value: key }, value: { type: 'Value', value: value[key] } })
      }
    } else {
      fileBody.push({ type: 'Key', name: { type: 'Name', value: name }, value: { type: 'Value', value: file[name] } })
    }
  }

  return result
}
