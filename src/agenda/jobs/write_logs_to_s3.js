const s3 = require(appRoot + "/src/repo")

const LogItem = require(appRoot + "/src/logger/model")

const pad = num => (num > 9 ? "" : "0") + num;
const dateString = (d) => {
  return `${d.year}-${d.month}-${d.day}`
}

const headerLine =
  `Id,Method,IP,Agent,Host,Path,OriginalURL,ResponseTimeMS,ContentLength,CreatedDate`;

const getPastDayLogs = async () => {

  const todayDate = new Date();
  const logDate = new Date();
  todayDate.setDate(todayDate.getDate() + 1);

  const startDateParts = {
    year: logDate.getFullYear().toString(),
    month: pad(logDate.getMonth() + 1),
    day: pad(logDate.getDate())
  }

  const endDateParts = {
    year: todayDate.getFullYear().toString(),
    month: pad(todayDate.getMonth() + 1),
    day: pad(todayDate.getDate())
  }

  const yesterdayStart = dateString(startDateParts),
        todayStart = dateString(endDateParts);

  console.log("Gathering logs for", yesterdayStart, todayStart)

  const results = await LogItem.find({
    createdAt: { $gte: yesterdayStart, $lt: todayStart }
  })

  console.log(results)

  return {
    status: "success"
  }

}

module.exports = getPastDayLogs
