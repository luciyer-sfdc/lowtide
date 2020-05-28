const jsforce = require("jsforce")

const config = require(appRoot + "/config")
const { Payload } = require("./objects")

const df_endpoint = config.endpoints.dataflows

exports.list = async (connection) => {

  return connection.request(df_endpoint)

}

exports.create = async (connection, name, label, defn) => {

  const payload = new Payload(name, label, defn)

  return connection.requestPost(df_endpoint, payload)

}

exports.update = async (connection, id, name, label, defn) => {

  const payload = new Payload(name, label, defn)

  return connection.requestPatch(`${df_endpoint}/${id}`, payload)

}
