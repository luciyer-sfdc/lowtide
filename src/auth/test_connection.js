const jsforce = require("jsforce")

const USER = "admin@eapmm-20200309.rcg.ido",
      PASS = "sfdc1234";

exports.getConnection = () => {

  console.log("Using Testing Connection:", USER)

  return new Promise((resolve, reject) => {

    const conn = new jsforce.Connection()

    conn.login(USER, PASS, (error, userInfo) => {

      if (error)
        return console.error(err)

      resolve(conn)

    })

  })

}
