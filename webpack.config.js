module.exports = {
  entry: './source/index.js',
  output: {
    path: 'public',
    filename: 'bundle.js'
  },
  externals: { firebase: 'firebase' },
  module: {
    loaders: [
      { test: /.js$/, exclude: /node_modules/, loader: 'babel'},
      { test: /.json$/, loader: 'json'}
    ]
  }
}
