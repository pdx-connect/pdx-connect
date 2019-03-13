import {Express} from "express";
import * as webpack from "webpack";
import * as WebpackDevMiddleware from "webpack-dev-middleware";
import * as WebpackHotMiddleware from "webpack-hot-middleware";
import historyApiFallback = require("connect-history-api-fallback");

export function init(app: Express) {
    // Load webpack configuration dynamically
    const webpackConfig = require("../../client/webpack.config")(void 0, {
        mode: "development"
    });
    // Verify webpack configuration
    if (webpackConfig.output == null) {
        throw "No 'output' defined in webpack configuration file!";
    }
    if (webpackConfig.output.publicPath == null) {
        throw "No 'output.publicPath' defined in webpack configuration file!";
    }
    // Load webpack modules
    const compiler: webpack.Compiler = webpack(webpackConfig);
    const webpackDevMiddleware = WebpackDevMiddleware(compiler, {
        publicPath: webpackConfig.output.publicPath,
        stats: "minimal"
    });
    const webpackHotMiddleware = WebpackHotMiddleware(compiler);
    // Apply webpack modules to Express app
    app.use(historyApiFallback());
    app.use(webpackDevMiddleware);
    app.use(webpackHotMiddleware);
}
