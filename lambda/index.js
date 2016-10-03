'use strict'
const Twitter = require('twit')
const Firebase = require('firebase')
const CONFIG = require('./config.json')

// console: https://apps.twitter.com/app/12881539/show
const twitter = new Twitter(CONFIG.twitter)

// console: https://console.firebase.google.com/project/tweeter-80d2b/database/data
const app = Firebase.initializeApp(CONFIG.firebase)


/** @return Firebase Promise of <Void>
*/
function storeTweet({tweet, media}) {
  console.log(tweet, media)
  const note = Firebase.database().ref(tweet.id.toString())
  const firebaseNote = note.set(tweet)

  if (media) {
    console.log('uploading picture to storage...')
    const storage = Firebase.storage().ref(tweet.id.toString())
    return storage.put(media)
  }
  else { return firebaseNote }
}


/** @return <Twit Promise> with result = <Twitter Response Obj>
*/
function postTweet(status, media_ids) {
  console.log('posting a tweet')
  console.log(status, media_ids)
  return new Promise((resolve, reject) => {
    twitter.post('statuses/update', {
      status,
      media_ids,
      trim_user: true
    }, function(error, tweet, response) {
      if (error) reject(error)
      else resolve(tweet)
    })
  })
}



function postPhoto(media, status) {
  console.log('posting some media')
  console.log(media)
  return new Promise((resolve, reject) => {
    twitter.postMediaChunked({ media }, function(error, data, response) {
      if (error) reject(error)
      else resolve(data)
    })
  })
}

const handler = (event, context, callback) => {
  const { media, status } = event
  let action

  if (media) {
    action = postPhoto(media, status)
      .then(response => response.media_id_string)
      .then(idString => postTweet(status, [idString]))
      .then(function handleTwitterResponse(result) {
        console.log('Successfully posted tweet!')
        console.log(result.data)
        return { tweet: result.data, media }
      })
  }

  else {
    action = postTweet(status)
      .then(function handleTwitterResponse(result) {
        console.log('Successfully posted tweet!')
        console.log(result.data)
        return { tweet: result.data }
      })
  }

  action.then(storeTweet)
    .then(function handleFirebaseResponse() {
      console.log('Firebase sync successful!')
      callback('Firebase sync successful!')
    })
    .catch(error => console.error(error))
}

exports.handler = handler

handler({
  event: { media: '', status: ''}
})
