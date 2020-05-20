const jsforce = require("jsforce")
const deploy = require("../src/deploy.js")

const conn = new jsforce.Connection()

conn.login('admin@eapmm-20200309.rcg.ido', 'sfdc1234', (err, res) => {
  if (err) { return console.error(err) }
  deploy.fromRepository(conn, [
    "CSV_Template",
    "Mortgage_Calculator",
    "Key_Account_Management_CG",
    "Einstein Analytics_Starter_Pack"
  ]).then(result => {
    console.log("returned")
    console.log(result)
  })
})
