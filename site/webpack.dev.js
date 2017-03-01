const webpack = require('webpack');
const path = require('path');

const BABEL_QUERY = {
  presets: ['react', 'es2015'],
  plugins: [
    ['transform-class-properties'],
    ['transform-decorators-legacy'],
    ['transform-object-rest-spread'],
    [
      'react-transform',
      {
        transforms: [{
          transform: 'react-transform-hmr',
          imports: ['react'],
          locals: ['module']
        }]
      }
    ]
  ]
};

module.exports = {
  devtool: 'inline-source-map',
  entry: [
    'webpack-hot-middleware/client?path=http://localhost:8000/__webpack_hmr',
    './src/index.js'
  ],
  context: path.resolve(__dirname),
  output: {
    filename: 'bundle.js',
    path: path.join(__dirname, 'dist'),
    publicPath: 'http://localhost:8000/dist/'
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
    new webpack.HotModuleReplacementPlugin()
  ]
};
