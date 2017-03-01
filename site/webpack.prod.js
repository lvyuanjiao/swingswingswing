const webpack = require('webpack');
const path = require('path');

const BABEL_QUERY = {
  presets: ['react', 'es2015'],
  plugins: [
    ['transform-class-properties'],
    ['transform-decorators-legacy'],
    ['transform-object-rest-spread']
  ]
};

module.exports = {
  entry: [
    './src/index.js'
  ],
  context: path.resolve(__dirname),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'static', 'dist')
  },
  module: {
    loaders: [
      { test: /\.jsx?$/, exclude: /(node_modules)/, loader: 'babel', query: BABEL_QUERY }
    ]
  },
  progress: true,
  resolve: {
    modulesDirectories: ['src', 'node_modules'],
    extensions: ['', '.json', '.js', '.jsx']
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        'NODE_ENV': JSON.stringify('production')
      }
    }),
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.optimize.OccurenceOrderPlugin()
  ]
};
