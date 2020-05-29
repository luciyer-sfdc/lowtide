const { create } = require("xmlbuilder2")

exports.generateXML = () => create({
    encoding: "UTF-8"
  }, {
    Package: {
      "@xmlns": "http://soap.sforce.com/2006/04/metadata",
      types: {
        members: "*",
        name: "WaveTemplateBundle"
      },
      version: "48.0"
    }
}).end({ prettyPrint: true })
