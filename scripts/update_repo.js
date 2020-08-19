const agenda = require("../src/agenda")

const execute = async () => {

  const args = minimist(process.argv.slice(2))

  if (!args.branch)
    return console.log("Please include --branch [master|beta]")

  if (args.branch !== "master" && args.branch !== "beta")
    return console.log("Unrecognized branch. Options: [master|beta].")

  const update_job = await agenda.now("update_repository", {
    branch: args.branch
  })

}

execute()
