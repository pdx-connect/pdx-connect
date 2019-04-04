import * as os from "os";
import * as path from "path";
import * as webpack from "webpack";
import CleanWebpackPlugin from "clean-webpack-plugin";
import * as CopyWebpackPlugin from "copy-webpack-plugin";
import * as HtmlWebpackPlugin from "html-webpack-plugin";

export = (env: unknown, argv: { mode: string }): webpack.Configuration => {
    const dev: boolean = argv.mode == null || argv.mode === "development";
    
    const inputPath: string = path.resolve(__dirname, "src");
    const outputPath: string = path.resolve(__dirname, "dist");
    
    const template: string = "index.html";
    const publicPrefix: string = dev ? "" : "public";
    
    const entries: string[] = [
        "./index.tsx"
    ];
    
    const plugins: webpack.Plugin[] = [];
    plugins.push(new CleanWebpackPlugin());
    plugins.push(new CopyWebpackPlugin([
        { from: "favicon.ico" },
        { from: "resources", to: "resources" }
    ]));
    plugins.push(new HtmlWebpackPlugin({
        filename: path.resolve(outputPath, template),
        template: template,
        inject: "body"
    }));
    
    const output: webpack.Output = {
        path: path.resolve(outputPath, publicPrefix),
        publicPath: ""
    };
    
    if (dev) {
        entries.push("webpack-hot-middleware/client");
        plugins.push(new webpack.HotModuleReplacementPlugin());
        output.filename = "bundle.js?[hash]";
    } else {
        output.filename = "bundle.js?[chunkhash]";
    }
    
    const config: webpack.Configuration = {
        mode: dev ? "development" : "production",
        context: inputPath,
        entry: entries,
        resolve: {
            extensions: [".ts", ".tsx", ".js"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    loader: "awesome-typescript-loader",
                    options: {configFileName: path.resolve(inputPath, "tsconfig.json")}
                },
                {test: /\.js$/, enforce: "pre", loader: "source-map-loader"},
                {test: /\.css$/, use: ["style-loader", "css-loader"]}
            ]
        },
        plugins: plugins,
        target: "web",
        parallelism: os.cpus().length,
        node: {
            __dirname: false,
            __filename: false,
            console: false,
            global: false,
            process: false,
            Buffer: false,
            setImmediate: false
        },
        output: output
    };
    
    if (dev) {
        if (config.resolve == null) {
            config.resolve = {};
        }
        if (config.resolve.alias == null) {
            config.resolve.alias = {};
        }
        config.resolve.alias["react-dom"] = "@hot-loader/react-dom";
        config.devtool = "source-map";
    }
    
    return config;
};
