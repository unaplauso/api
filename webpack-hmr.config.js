const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

// "start:dev": "nest start --webpack --webpackPath webpack-hmr.config.js --watch",

module.exports = (options, webpack) => ({
	...options,
	entry: ['webpack/hot/poll?100', options.entry],
	externals: [
		nodeExternals({
			allowlist: ['webpack/hot/poll?100'],
		}),
	],
	plugins: [
		...options.plugins,
		new webpack.HotModuleReplacementPlugin(),
		new webpack.WatchIgnorePlugin({
			paths: [/\.js$/, /\.d\.ts$/],
		}),
		new RunScriptWebpackPlugin({
			name: options.output.filename,
			autoRestart: false,
		}),
	],
	/*
	const swcDefaultConfig =
	require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
		.swcOptions;

	module: {
		rules: [
			{
				test: /\.ts$/,
				exclude: /node_modules/,
				use: {
					loader: 'swc-loader',
					options: swcDefaultConfig,
				},
			},
		],
	},
	*/
});
