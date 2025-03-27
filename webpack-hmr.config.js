const nodeExternals = require('webpack-node-externals');
const { RunScriptWebpackPlugin } = require('run-script-webpack-plugin');

const swcDefaultConfig =
	require('@nestjs/cli/lib/compiler/defaults/swc-defaults').swcDefaultsFactory()
		.swcOptions;

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
});
