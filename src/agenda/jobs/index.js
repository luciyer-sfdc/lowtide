module.exports = {
  newTemplate: require("./app_template").create,
  updateTemplate: require("./app_template").update,
  timeshift: require("./timeshift_datasets"),
  updateTimeshift: require("./update_timeshift_dataflow"),
  deployS3Templates: require("./deploy_from_s3"),
  refreshDatasets: require("./touch_datasets").firstTouch,
  checkRefresh: require("./touch_datasets").checkRefresh
}
