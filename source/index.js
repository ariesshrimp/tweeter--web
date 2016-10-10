'use strict'
import React from 'react'
import ReactDOM from 'react-dom'

import TweetForm from './components/TweetForm/index.js'
import Spinner from './components/LoadSpinner/index.js'

const App = React.createClass({
  getInitialState() {
    return { loading: false }
  },

  toggleLoading(asyncFunction) {
    // Return a function that eats DOM events and passes them to the async operation
    return event => {
      // Flip the loading state when we begin an asyn request
      this.setState({ loading: !this.state.loading })

      asyncFunction(event)

        // Flip the loading state again when that operation completes
        .then(results => this.setState({ loading: !this.state.loading }))
    }
  },

  render() {
    return <div id="App">
      <h1 className="heading">Tweeter</h1>
      <TweetForm toggleLoading={ this.toggleLoading }/>
      { this.state.loading ? <Spinner /> : null }
    </div>
  }
})

ReactDOM.render(<App />, document.getElementById('mount'))
