const mongoose = require("mongoose")

const logItemSchema = new mongoose.Schema({
  method: String,
  body: Object,
  ip: String,
  agent: String,
  host: String,
  origin: String,
  path: String,
  originalUrl: String,
  status: Number,
  responseTime: Number,
  contentLength: Number
}, { timestamps: true })

module.exports = mongoose.model("LogItem", logItemSchema)
