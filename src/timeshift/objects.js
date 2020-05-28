class Payload {
  constructor(name, label, defn) {
    this.name = name
    this.label = label
    this.definition = defn || {}
  }
}

module.exports = {
  Payload: Payload
}
