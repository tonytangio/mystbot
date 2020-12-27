const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/mystbot.ts',
    target: "node",
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'mystbot.js',
    },
    resolve: {
        modules: ['src', 'node_modules'],
        extensions: [ '.ts', '.js', '.json', '.node' ],
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.node$/,
                loader: 'node-loader'
            }
        ]
    }
};