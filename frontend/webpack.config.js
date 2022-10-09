const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
module.exports = {
mode: 'development',
entry: './index.tsx',
devtool: 'inline-source-map',
output: {
path: path.join(__dirname, '/dist'),
filename: 'bundle.js'
},
devtool: 'inline-source-map',
devServer: {
static: './dist',
},
module: {
rules: [
{
test: /\.jsx?$/,
exclude: /node_modules/,
loader: 'babel-loader'
},
{
test: /\.tsx?$/,
loader: 'ts-loader',
options: {configFile: path.resolve('./ts-config.json')},
exclude: /node_modules/,
},
]
},
resolve: {
extensions: ['.tsx', '.ts', '.js'],
},
plugins:[
new HtmlWebpackPlugin({
template: './index.html'
})
]
}