import * as path from "path";
import * as webpack from "webpack";
import * as CleanWebpackPlugin from "clean-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";

const input: string = path.resolve(__dirname + "/src");
const output: string = path.resolve(__dirname + "/dist");

const plugins: webpack.Plugin[] = [];
plugins.push(new CleanWebpackPlugin(output));
plugins.push(new CopyWebpackPlugin([
    { from: "favicon.ico" },
    { from: "resources", to: "resources" }
]));
plugins.push(new HtmlWebpackPlugin({
    template: "index.html",
    inject: "body"
}));

const config: webpack.Configuration = {
    mode: "development",
    context: input,
    entry: "./index.tsx",
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    module: {
        rules: [
            { test: /\.tsx?$/, loader: "awesome-typescript-loader" },
            { test: /\.js$/, enforce: "pre", loader: "source-map-loader" }
        ]
    },
    plugins: plugins,
    target: "web",
    devtool: "source-map",
    parallelism: 8,
    node: {
        __dirname: false,
        __filename: false,
        console: false,
        global: false,
        process: false,
        Buffer: false,
        setImmediate: false
    },
    output: {
        path: output,
        filename: "bundle.js?[chunkhash]"
    }
};

module.exports = config;
