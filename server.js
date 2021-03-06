const express = require('express');
const app = express();
const chalk = require('chalk');
const env = process.env.NODE_ENV || 'development';
const port = process.env.PORT || 3000;

if (env === 'development') {
  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const config = require('./webpack.config.js');
  const compiler = webpack(config);
  app.use(webpackDevMiddleware(compiler, {
    publicPath: config.output.publicPath,
  }));
}

app.use(express.static('client'));

app.listen(port, () => {
  const {bgRed, bgYellow, bgGreen, bgCyan, white} = chalk;
  const phaser = `${bgRed(' ')}${bgYellow(' ')}${bgGreen(' ')}${bgCyan(' ')}`;
  const name = process.env.npm_package_name;
  const version = process.env.npm_package_version;
  console.log(white.bgBlack(`${phaser} ${name} ${version} http://localhost:${port} `));
});
