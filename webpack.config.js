const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './source/index.js',
  output: {
    path: 'public',
    filename: 'bundle.js',
    publicPath: '/'
  },
  externals: { firebase: 'firebase' },
  module: {
    loaders: [
      { test: /.js$/, exclude: /node_modules/, loader: 'babel'},
      { test: /.json$/, loader: 'json'},
      { test: /\.scss$/, loader: ExtractTextPlugin.extract('style', 'css-loader?minify&modules&importLoaders=1&localIdentName=[local]::[path]!sass?sourceMap') },
    ]
  },
  plugins: [
    new ExtractTextPlugin('styles.css')
  ]
}
