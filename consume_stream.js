var Twit = require('twit'),
    config = require('config')

var T = new Twit(config)



var stream = T.stream('user')

stream.on('connect', function (request) {
  console.log('connecting')
//  console.log(request)
})

stream.on('disconnect', function (disconnectMessage) {
  console.log('dicsonnect')
  console.log(disconnectMessage)
})

stream.on('reconnect', function (request, response, connectInterval) {
  console.log('reconnect')
})

stream.on('tweet', function (tweet) {
  console.log(tweet)
  stream.stop()
})

stream.on('error', function(err) {
  console.log('error')
  console.log(err)
  stream.stop()
})

