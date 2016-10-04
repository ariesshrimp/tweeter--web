// The zip file is too large to upload directly to Lambda now,
// So you have to update an S3 bucket and copy-paste the link over instead 🙄
// https://console.aws.amazon.com/s3/home?region=us-east-1#&bucket=lambda-code-jf2&prefix=
'use strict'
console.log('Running lambda')
const gcloud = require('google-cloud')
const Twitter = require('twit')
const fs = require('fs')
const Firebase = require('firebase')
const CONFIG = require('./config.json')

// console: https://apps.twitter.com/app/12881539/show
const twitter = new Twitter(CONFIG.twitter)

// console: https://console.firebase.google.com/project/tweeter-80d2b/database/data
const app = Firebase.initializeApp(CONFIG.firebase)

// https://console.cloud.google.com/apis/dashboard?project=tweeter-80d2b&duration=PT1H
const storage = gcloud.storage(CONFIG.gcloud)
const bucket = storage.bucket(CONFIG.firebase.storageBucket)


console.log('successful configuration')


/** @return Firebase Promise of <Void>
*/
function storeTweet(data) {
  const tweet = data.tweet
  const media = data.media
  console.log('storing tweet: ', tweet, 'with optional media: ', media)

  let result

  const note = Firebase.database().ref(tweet.id.toString())
  console.log('new firebase ref: ', note)


  if (media) {
    console.log('Firebase found media...')
    return note.set(tweet).then(result => {
      console.log('uploading picture to storage...')

      const fileName = `${ tweet.id.toString() }.${ media.fileType }`
      const path = `/tmp/${ fileName }`
      const file = fs.writeFileSync(path, media.data, 'base64', error => console.error(error))

      return new Promise((resolve, reject) => {
        const options = { destination: fileName }

        bucket.upload(path, options, function handle_google_cloud_response_to_upload(error, result) {
          if (error) reject(error)
          resolve(result)
        })
      })
    })
  }
  else {
    console.log('uploading a text-only tweet...')
    return note.set(tweet)
  }
}


/** @return <Twit Promise> with result = <Twitter Response Obj>
*/
function postTweet(status, media_ids) {
  console.log('posting a tweet. status: ', status, 'optional media: ', media_ids)
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



function postMedia(media, status) {
  console.log('posting some media. media: ', media, 'accompanying status: ', status)
  console.log(media)
  return new Promise((resolve, reject) => {
    twitter.post('media/upload', { media_data: media.data }, function (error, data, response) {
      if (error) reject(error)
      else resolve(data)
    })
  })
}

exports.handler = (event, context, callback) => {
  // XXX: for more information about this weird shit, see:
  // http://stackoverflow.com/questions/38560186/process-timeout-amazon-lambda-to-firebase
  context.callbackWaitsForEmptyEventLoop = false

  console.log('entering handler code...')
  const status = event.status
  const media = event.media

  let action

  if (media) {
    console.log('media found:', media)
    console.log('status: ', status)
    action = postMedia(media, status)
      .then(response => response.media_id_string)
      .then(idString => postTweet(status, [idString]))
      .then(function handleTwitterResponse(result) {
        console.log('Successfully posted tweet with media!')
        console.log(result)
        return { tweet: result, media }
      })
  }

  else {
    console.log('new status: ', status)
    action = postTweet(status)
      .then(function handleTwitterResponse(result) {
        console.log('Successfully posted tweet with no media!')
        console.log(result)
        return { tweet: result }
      })
  }

  action.then(storeTweet)
    .then(function handleFirebaseResponse(result) {
      callback(null, result)
    })
    .catch(error => {
      console.error(error)
      callback(error)
    })
}
