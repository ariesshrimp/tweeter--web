'use strict'
import React from 'react'
import ReactDOM from 'react-dom'

import TweetForm from './components/TweetForm/index.js'


function App(props) {
  return <div id="react-app-root">
    <h1 className="heading">Tweeter</h1>
    <TweetForm />
  </div>
}

ReactDOM.render(<App />, document.getElementById('mount'))
