const config = require('../config')

console.log(config)

console.log(config.ltApi("auth_request"))


console.log(config.sfApi(config.sf_rest.url, "wave_folders"))
