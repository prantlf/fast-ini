const addValue = (section, key, value, replacer, minify) => {
  if (replacer) {
    value = replacer(section, key, value)
    if (value === undefined) return
  }
  return minify ? `${key}=${value}` : `${key} = ${value}`
}

export function write(file, { replacer, minify } = {}) {
  let properties = ''
  let sections = ''

  for (const name in file) {
    const value = file[name]
    if (typeof value === 'object') {
      sections += !(minify || sections) ? `\n[${name}]\n` : `[${name}]\n`
      for (const key in value) {
        const result = addValue(name, key, value[key], replacer, minify)
        if (result) sections += `${result}\n`
      }
    } else {
      const result = addValue(null, name, value, replacer, minify)
      if (result) properties += `${result}\n`
    }
  }

  return properties + sections
}
