const path = require('path');
const HtmlWebPackPlugin = require('html-webpack-plugin');
const MonacoWebpackPlugin = require('monaco-editor-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
	mode: isDevelopment ? 'development' : 'production',
	entry: {
		app: './src/index.tsx',
		'editor.worker': 'monaco-editor/esm/vs/editor/editor.worker.js',
		'json.worker': 'monaco-editor/esm/vs/language/json/json.worker',
		'yaml.worker': 'monaco-yaml/yaml.worker'
	},
	devServer: {
		hot: true
	},
	resolve: {
		extensions: ['*', '.js', '.jsx', '.tsx', '.ts']
	},
	output: {
		globalObject: 'self',
		filename: '[name].bundle.js',
		path: path.resolve(__dirname, 'dist')
	},
	module: {
		rules: [
			{
				test: /\.(js|jsx|tsx|ts)$/,
				exclude: /node_modules/,
				use: [
					{
						loader: require.resolve('babel-loader'),
						options: {
							presets: ['@babel/preset-env', '@babel/preset-react', '@babel/preset-typescript'],
							plugins: [isDevelopment && require.resolve('react-refresh/babel')].filter(Boolean)
						}
					}
				]
			},
			{
				test: /\.css$/,
				use: ['style-loader', 'css-loader']
			},
			{
				test: /\.ttf$/,
				use: ['file-loader']
			}
		]
	},
	plugins: [
		new HtmlWebPackPlugin({
			template: 'src/index.html'
		}),
		isDevelopment && new ReactRefreshWebpackPlugin(),
		new MonacoWebpackPlugin({
			languages: ['yaml'],
			customLanguages: [
			  {
				label: 'yaml',
				entry: 'monaco-yaml',
				worker: {
				  id: 'monaco-yaml/yamlWorker',
				  entry: 'monaco-yaml/yaml.worker'
				}
			  }
			]
		  })
	].filter(Boolean)
};
