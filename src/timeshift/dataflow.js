const jsforce = require("jsforce")

const config = require(appRoot + "/config")
const { Payload } = require("./objects")

const auth = require(appRoot + "/src/auth") //Testing

const df_endpoint = config.endpoints.dataflows

exports.list = async (connection) => {

  console.log("Running timeshift/dataflow/get.")

  const conn = await auth.testing.getConnection()

  console.log("GET", "@", df_endpoint)

  return conn.request(df_endpoint)

}

exports.create = async (connection, name, label, defn) => {

  console.log("Running timeshift/dataflow/create.")

  const conn = await auth.testing.getConnection(),
        payload = new Payload(name, label, defn);

  console.log("POST", payload, "@", df_endpoint)

  return conn.requestPost(df_endpoint, payload)

}

exports.update = async (connection, id, name, label, defn) => {

  console.log("Running timeshift/dataflow/update.")

  const conn = await auth.testing.getConnection(),
        payload = new Payload(name, label, defn);

  console.log("PATCH", payload, "@", df_endpoint)

  return conn.requestPatch(`${df_endpoint}/${id}`, payload)


}
