require("dotenv").config()

const fsp = require("fs").promises
const path = require("path")
const copy = require("ncp").ncp
const pull = require("github-download")
const exec = require("exec")
const minimist = require("minimist")

const base_dir = path.normalize(__dirname + "/../..")

const repo_remote = process.env.REPO_REMOTE || "https://github.com/ttse-sfdc/sfdc-ea-demo-templates.git",
      master_branch = process.env.REPO_MASTER_BRANCH || "master",
      beta_branch = process.env.REPO_BETA_BRANCH || "beta";

const repo = {
  remote: repo_remote,
  branches: {
    master: master_branch,
    beta: beta_branch
  },
  template_path: "/force-app/main/default/waveTemplates"
}

const templates = {
  staging: base_dir + "/templates/staging",
  beta: base_dir + "/templates/beta",
  master: base_dir + "/templates/master"
}

const clearFolder = (folder_path) => {
  return fsp.rmdir(folder_path, { recursive: true })
}

exports.updateRepo = async () => {

  const args = minimist(process.argv.slice(2))

  if (!args.branch)
    return console.log("Please include --branch [master|beta]")

  const beta = args.branch === "beta"

  let target, branch;

  if (beta) {
    target = templates.beta
    branch = repo.branches.beta
  } else {
    target = templates.master
    branch = repo.branches.master
  }

  console.log(`Updating ${target} from branch \"#${branch}\"...`)

  await clearFolder(templates.staging)
  console.log("Cleared staging.")

  console.log(`Downloading #${branch} to staging...`)

  pull(`${repo.remote}#${branch}`, templates.staging)
    .on("zip", (zip_url) => {
      console.log("Request returned 403 (API limit reached).")
      console.log(`Retrieve zip from ${zip_url}.`)
    })
    .on("end", async () => {

      console.log(`#${branch} downloaded to staging.`)

      await clearFolder(target)
      console.log(`Cleared target.`)

      await copy(templates.staging + repo.template_path, target)
      console.log(`Templates copied to target.`)

      console.log(`Done!\n`)

    })

}
