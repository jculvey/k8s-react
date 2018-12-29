const keys = require("./keys");
const redis = require("redis");

const redisClient = redis.createClient({
  host: keys.redisHost,
  port: keys.redisPort,
  retryStrategy: () => 1000
});

const fib = index => {
  if (index < 2) return 1;
  return fib(index - 2) + fib(index - 1);
};

// Create a message handler
const sub = redisClient.duplicate();
sub.on("message", (channel, number) => {
  redisClient.hset("values", number, fib(parseInt(number)));
});

// Subscribe to insertions
sub.subscribe("insert");
