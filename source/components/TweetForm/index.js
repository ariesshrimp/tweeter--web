'use strict'
import React from 'react'
import { handler } from '../../API/index.js'

function handleSubmit(event) {
  event.preventDefault()
  console.log('Button clicked')

  // Grab the tweet status
  const form = document.getElementById('tweetForm')
  const status = form.value

  // Grab the photo. XXX: could be undefined
  const media = document.getElementById('file').files[0]
  const path = media ? media.path : undefined

  // Reset the form
  form.value = ''
  document.getElementById('file').value = ''
  document.getElementById('remaining').innerHTML = `140 remaining`

  return handler({ media, status })
}

function handleTyping(event) {
  const string = event.target.value
  const remaining = 140 - string.length
  document.getElementById('remaining').innerHTML = `${remaining} remaining`
}

export default function TweetForm() {
  return <div id="form">
    <textarea id="tweetForm" maxLength="140" placeholder="What's on your mind?" required onChange={ handleTyping }></textarea>
    <div className="column">
      <span id="remaining">140 remaining</span>
      <div className="column">
        <input type="file" id="file" />
        <button onClick={ handleSubmit }>Tweet</button>
      </div>
    </div>
  </div>
}
