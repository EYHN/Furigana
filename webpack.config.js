module.exports = {
  entry: {
    'content': __dirname  + '/content.js',
    'background': __dirname  + '/background.js'
  },
  devtool: 'source-map',
  output: {
    path: __dirname  + '/dist',
    filename: '[name].js'
  },
  resolve: {
    alias: {
      kuromoji: __dirname + '/kuromoji',
    }
  }
};