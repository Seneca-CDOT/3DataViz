var Twitter = require('twitter');

var client = new Twitter({
  consumer_key: 'QQAcvp4EqQ7kzt7X1hzbz8TcV',
  consumer_secret: '2gJthr5qPeuBdxOZBIoQIfrEm8ilFYpn5uJ7h5cvLigWiGLjEL',
  access_token_key: '2969256611-shFx17Q57hCL3cZzDmLiNmdSKkQKVGcnjwTwf7q',
  access_token_secret: 'VE5IFO9IGgd2EjG5IPCSlZbQN3Xpl9UHf0vrUvyAfb7su'
});

//var loc = [-122.75,36.8,-121.75,37.8];

client.stream('statuses/filter',
  {
    track: 'Love',
    language: 'en',
    // locations: loc    
  }, function(stream) {
  stream.on('data', function(tweet) {
    // console.log(tweet);
    if(tweet.geo){
      console.log("==========================")
      console.log("Name: "+ tweet.user.name);
      console.log("Tweet: "+ tweet.text);
      console.log(tweet.geo);
      console.log("ProfileImage: "+ tweet.user.profile_image_url)
      console.log("Timestamp: "+ tweet.timestamp_ms);
    }
  });

  stream.on('end', function() {
    console.log("end");
  });

  stream.on('error', function(error) {
    throw error;
  });

});
