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
  var created_at_regex = /^(\w{3}) (\w{3}) (\d{2}) (\d{2}:\d{2}:\d{2}) \+0000 (\d{4})/
  var created_at = created_at_regex.exec(tweet.created_at)
  var date = new Date(created_at[1]+", "+created_at[3]+" "+created_at[2]+" "+created_at[5]+" "+created_at[4]+" +0000")
  console.log(tweet.created_at, date, date.getTime())
  db.set('tweet:'+tweet.id_str, JSON.stringify(tweet), redis.print)
  db.expire('tweet:'+tweet.id_str, 604800, redis.print) // 7 days
  db.lpush('timeline', tweet.id_str, redis.print)
  db.zadd('timeline_sorted_epoch', date.getTime(), tweet.id_str, redis.print)
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
