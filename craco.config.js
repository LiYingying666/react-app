const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");

module.exports = {
    webpack: {
        plugins: {
            add: [
                new BundleAnalyzerPlugin({
                    analyzerMode: "server",
                    analyzerHost: "localhost",
                    analyzerPort: 8888,
                    reportFilename: "report.html",
                    openAnalyzer: true,
                    generateStatsFile: true,
                    statsFilename: "stats.json",
                }),
            ],
        },
    },
};
