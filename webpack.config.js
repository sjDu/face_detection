// webpack.config.js

var webpack = require('webpack');

var definePlugin = new webpack.DefinePlugin({
    'process.env': {
        NODE_ENV: JSON.stringify('production')
    },
    // __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),  

});

// var definePlugin = new webpack.DefinePlugin({
//   __DEV__: JSON.stringify(JSON.parse(process.env.BUILD_DEV || 'true')),
//   __PRERELEASE__: JSON.stringify(JSON.parse(process.env.BUILD_PRERELEASE || 'false'))
// });

module.exports = {
    entry: [
        './src/index.js',
        // 'webpack-dev-server/client?http://127.0.0.1:3000', // WebpackDevServer host and port
    ],
    output: {
        filename: './build/fdrControl.js',
        // export itself to a global var
        libraryTarget: 'var',
        // name of the global var: 'sss'
        library: 'FdrControl'
    },
    module: {
        loaders: [
            { test: /\.coffee$/, loader: 'coffee-loader' },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-decorators-legacy'],
                    presets: ['es2015', 'react', 'stage-0']
                },
                exclude: /node_modules/
            }
            // { test: /\.js$/, loaders: [ 'jsx?harmony'], exclude: /node_modules/ }
        ]
    },
    resolve: {
        // you can now require('file') instead of require('file.coffee')
        extensions: ['', '.js', '.json', '.coffee']
    },
    plugins: [
        definePlugin,
        // new webpack.optimize.CommonsChunkPlugin('vendors', 'vendors.js')
    ]
};