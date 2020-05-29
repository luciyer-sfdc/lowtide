const path = require("path")
const ncp = require("ncp").ncp
const fs = require("fs")

class WaveTemplateRepresentation {

  constructor(source) {
    this.name = path.basename(source)
    this.source = source
    this.copy_destination = null
  }

  get is_valid_structure () {
    /*
      IMPLEMENT
      https://developer.salesforce.com/docs/atlas.en-us.api_meta.meta/api_meta/meta_wavetemplatebundle.htm
    */
  }

  async copyTo(destination) {

    this.copy_destination = `${destination}/${this.name}`

    if (!fs.existsSync(this.copy_destination))
      fs.mkdirSync(this.copy_destination, { recursive: true })

    ncp(this.source, this.copy_destination, (err) => {
      err
        ? console.error(err)
        : console.log(this.name, "copied to", this.copy_destination)
    })

  }

}

module.exports = WaveTemplateRepresentation
