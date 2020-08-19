module.exports = {
  newTemplate: require("./app_template").create,
  updateTemplate: require("./app_template").update,
  timeshift: require("./timeshift_datasets"),
  updateTimeshift: require("./update_timeshift_dataflow"),
  deployTemplates: require("./deploy_templates"),
  refreshDatasets: require("./touch_datasets").firstTouch,
  checkRefresh: require("./touch_datasets").checkRefresh,
  updateRepo: require("./update_template_repository")
}
