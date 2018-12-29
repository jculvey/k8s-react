const keys = require("./keys");
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const redis = require("redis");
const { Pool } = require("pg");

// pg client setup
const pgClient = new Pool({
  user: keys.pgUser,
  password: keys.pgPassword,
  host: keys.pgHost,
  port: keys.pgPort,
  database: keys.pgDatabase
});
pgClient.on("error", () => console.log("Lost PG Connection..."));

let dbInitialized = false;
const readyDB = async () => {
  if (dbInitialized) return;

  console.log("INITIALIZING DB");
  await pgClient
    .query(`CREATE TABLE IF NOT EXISTS values(NUMBER INT)`)
    .catch(err => console.log(err));
  dbInitialized = true;
};

// redis client setup
const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retry_strategy: () => 1000
});
const redisPublisher = redisClient.duplicate();

// express
const app = express();
app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
  res.send("Hello");
});

app.get("/values/all", async (req, res) => {
  await readyDB();
  const values = await pgClient.query("SELECT * FROM values;");
  res.send(values.rows);
});

app.get("/values/current", async (req, res) => {
  redisClient.hgetall("values", (err, values) => {
    if (err) {
      console.log(err);
    }
    res.send(values);
  });
});

app.post("/values", async (req, res) => {
  await readyDB();

  if (!parseInt(req.body.index)) {
    return res.status(422).send("Index must be a number");
  }
  const index = parseInt(req.body.index);

  if (index > 40) {
    return res.status(422).send("Index too high");
  }

  redisClient.hset("values", index, "Nothing yet!");
  redisPublisher.publish("insert", index);
  pgClient.query(`INSERT INTO values(number) VALUES(${index})`);
});

app.listen(5000, err => console.log("Listening on port 5000"));
