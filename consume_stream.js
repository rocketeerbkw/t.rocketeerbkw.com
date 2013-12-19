var Twit = require('twit'),
    redis = require('redis'),
    config = require('./config')

var T = new Twit(config),
    db = redis.createClient(),
    stream = T.stream('user')

stream.on('connect', function (request) {
  console.log('Connected to stream...')
})

stream.on('reconnect', function (request, response, connectInterval) {
  console.log('reconnecting to stream...')
})

/**
 * Twitter sent a disconnect message to us
 */
stream.on('disconnect', function (disconnectMessage) {
  console.log('Disconnected from stream!')
  console.log(disconnectMessage)
  quit()
})


stream.on('tweet', function (tweet) {
  console.log('set tweet:'+tweet.id_str)
  db.set('tweet:'+tweet.id_str, JSON.stringify(tweet), redis.print)
  db.expire('tweet:'+tweet.id_str, 604800, redis.print) // 7 days
  db.lpush('timeline', tweet.id_str, redis.print)
})

stream.on('error', function(err) {
  console.log('Stream error!')
  console.log(err)
  quit()
})

/**
 * Quit and cleanup
 */
function quit() {
  stream.stop()
  db.quit()
}
