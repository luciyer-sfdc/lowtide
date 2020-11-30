require("dotenv").config()

const redis = require("redis")
const session = require("express-session")

let RedisStore = require("connect-redis")(session)
let redisClient = redis.createClient(process.env.REDIS_URL)

const sessionOptions = {
  name: "lowtide.auth",
  secret: process.env.SESSION_SECRET,
  cookie: { maxAge: (60 * 60000) },
  store: new RedisStore({ client: redisClient }),
  saveUninitialized: false,
  resave: false
}

module.exports = session(sessionOptions)
