const onFinished = require("on-finished");

const LogItem = require("./model")

module.exports = (req, res, next) => {

  const startAt = process.hrtime()

  onFinished(res, async (err, res) => {

    const elapsed = process.hrtime(startAt),
          ms = (elapsed[0] * 1e3) + (elapsed[1] * 1e-6);

    try {

      await LogItem.create({
        method: req.method,
        body: req.body,
        ip: req.ip,
        agent: req.get("user-agent"),
        host: req.get("host"),
        origin: req.get("origin"),
        path: req.path,
        originalUrl: req.originalUrl,
        status: res.get("status"),
        responseTime: ms.toFixed(3),
        contentLength: res.get("content-length")
      })

    } catch (error) {
      console.error(error.message)
    }

  })

  next()

}
