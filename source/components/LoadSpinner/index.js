import React from 'react'
import CSS from './styles.scss'

const Spinner = props => {
  return <div className={ CSS.progress }>
    <div>Loading...</div>
  </div>
}

export default Spinner
