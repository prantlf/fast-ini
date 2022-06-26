export default {
  file(body) {
    return { type: 'File', body }
  },

  section(name, body) {
    return { type: 'Section', name, body }
  },

  key(name, value) {
    return { type: 'Key', name, value }
  },

  name(value, raw) {
    return { type: 'Name', value, raw }
  },

  value(value) {
    return { type: 'Value', value }
  }
}
