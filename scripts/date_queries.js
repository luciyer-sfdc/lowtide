const path = require("path")

global.appRoot = path.resolve(__dirname + "/..")

const auth = require(appRoot + "/src/auth")
const timeshift = require(appRoot + "/src/timeshift")

const testGetFolderDatasets = () => {

  auth.testing.getConnection()
    .then(conn => {
      timeshift.dataset.getFolderDatasets(conn, "0053h000000IYITAA4")
        .then(results => {
          console.log(timeshift.dataset.parseResults(results))
        })
        .catch(console.error)
    })

}

const testGetDateValues = () => {

  auth.testing.getConnection()
    .then(conn => {
      timeshift.dates.getDateFields(conn, "0Fb3h0000004kjLCAQ")
        .then(dataset => {

          console.log("Dataset:", dataset.dataset_name)

          timeshift.dates.getDateValues(conn, dataset)
            .then(query_results => {

              console.log(timeshift.dates.parseResults(query_results))

            })
            .catch(console.error)

        })
        .catch(console.error)
    })
    .catch(console.error)

}

const testGenerateBranch = () => {

  auth.testing.getConnection()
    .then(conn => {

      timeshift.dataflow.generateBranch(conn, "0Fb3h0000004kjLCAQ")

    })
    .catch(console.error)

}

const testInsertDataflowBranch = () => {

  auth.testing.getConnection()
    .then(conn => {

      timeshift.dataflow.generateBranch(conn, "0Fb3h0000004kjLCAQ")
        .then(branch => {

          console.log(branch, branch.json, branch.object)

          timeshift.dataflow.create(conn, "Test888", branch.json)
            .then(console.log)
            .catch(console.error)

        })
        .catch(console.error)

    })
    .catch(console.error)


}

//testGetFolderDatasets()
//testGetDateValues()
//testGenerateBranch()
testInsertDataflowBranch()
