const path = require('path');
const CompressionWebpackPlugin = require('compression-webpack-plugin');
const zopfli = require("@gfx/zopfli");
const BrotliPlugin = require("brotli-webpack-plugin");
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const resolve = (dir) => path.join(__dirname, dir);
const IS_PROD = ['production', 'prod'].includes(process.env.NODE_ENV);

const DIST_ROOT = 'dist';
// 项目部署在服务器里的绝对路径，默认'/'，参考https://cli.vuejs.org/zh/config/#baseurl
const BASE_URL = '';
const STATIC_ROOT = 'static';
// 转为CND外链方式的npm包，键名是import的npm包名，键值是该库暴露的全局变量，参考https://webpack.js.org/configuration/externals/#src/components/Sidebar/Sidebar.jsx
const externals = {
    'vue': 'Vue',
    'vue-router': 'VueRouter',
    'vuex': 'Vuex',
    'flyio': 'flyio',
    'element-ui': 'ELEMENT'
};
// CDN外链，会插入到index.html中
const cdn = {
    // 开发环境
    dev: {
        css: [
            'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
        ],
        js: []
    },
    // 生产环境
    build: {
        css: [
            'https://unpkg.com/element-ui/lib/theme-chalk/index.css'
        ],
        js: [
            'https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.min.js',
            'https://cdn.jsdelivr.net/npm/vue-router@3.0.1/dist/vue-router.min.js',
            'https://cdn.jsdelivr.net/npm/vuex@3.0.1/dist/vuex.min.js',
            'https://cdn.jsdelivr.net/npm/axios@0.18.0/dist/axios.min.js',
            'https://unpkg.com/element-ui/lib/index.js'
        ]
    }
};

// 是否使用gzip
const productionGzip = true;
// 需要gzip压缩的文件后缀
const productionGzipExtensions = /\.(js|css|json|txt|html|ico|svg)(\?.*)?$/i;

module.exports = {
    publicPath: BASE_URL,
    outputDir: DIST_ROOT,

    // 放置静态资源的地方 (js/css/img/font/...)
    assetsDir: STATIC_ROOT,

    // 是否在保存的时候使用 `eslint-loader` 进行检查。
    // 有效的值：`ture` | `false` | `"error"`
    // 当设置为 `"error"` 时，检查出的错误会触发编译失败。
    lintOnSave: false,

    // babel-loader 默认会跳过 node_modules 依赖。
    // 通过这个选项可以显式转译一个依赖。
    transpileDependencies: [/* string or regex */],

    // 是否为生产环境构建生成 source map？
    productionSourceMap: true,

    // 在生产环境下为 Babel 和 TypeScript 使用 `thread-loader`
    // 在多核机器下会默认开启。
    parallel: require('os').cpus().length > 1,

    // PWA 插件的选项。
    // 查阅 https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli-plugin-pwa/README.md
    pwa: {},

    css: {
        // 将组件内的 CSS 提取到一个单独的 CSS 文件 (只用在生产环境中)
        // 也可以是一个传递给 `extract-text-webpack-plugin` 的选项对象
        extract: true,

        // 是否开启 CSS source map？
        sourceMap: false,

        // 为所有的 CSS 及其预处理文件开启 CSS Modules。
        // 这个选项不会影响 `*.vue` 文件。
        modules: false,

        // 为预处理器的 loader 传递自定义选项。比如传递给
        // sass-loader 时，使用 `{ sass: { ... } }`。
        loaderOptions: {
            css: {
                localIdentName: '[name]-[hash]',
                camelCase: 'only',
            },
            less: {},
            postcss: {
                plugins: [
                    require('postcss-px-to-viewport')({
                        viewportWidth: 750, // 视窗的宽度，对应的是我们设计稿的宽度，一般是750
                        viewportHeight: 1334, // 视窗的高度，根据750设备的宽度来指定，一般指定1334，也可以不配置
                        unitPrecision: 3, // 指定`px`转换为视窗单位值的小数位数（很多时候无法整除）
                        viewportUnit: 'vw', // 指定需要转换成的视窗单位，建议使用vw
                        selectorBlackList: ['.ignore', '.hairlines'], // 指定不转换为视窗单位的类，可以自定义，可以无限添加,建议定义一至两个通用的类名
                        minPixelValue: 1, // 小于或等于`1px`不转换为视窗单位，你也可以设置为你想要的值
                        mediaQuery: false // 允许在媒体查询中转换`px`著作权归作者所有。
                    }),
                ]
            }
        }
    },

    configureWebpack: config => {
        const plugins = [];

        if (IS_PROD) {
            // 1. 生产环境npm包转CDN
            // config.externals = externals;
            // 2. Zopfli压缩，需要响应VC库 https://webpack.js.org/plugins/compression-webpack-plugin/
            productionGzip && plugins.push(
                new CompressionWebpackPlugin({
                    algorithm(input, compressionOptions, callback) {
                        return zopfli.gzip(input, compressionOptions, callback);
                    },
                    compressionOptions: {
                        numiterations: 15
                    },
                    minRatio: 0.99,
                    test: productionGzipExtensions
                })
            );
            productionGzip && plugins.push(
                new BrotliPlugin({
                    test: productionGzipExtensions,
                    minRatio: 0.99
                })
            );

            // 3. 去掉 console.log
            plugins.push(
                new UglifyJsPlugin({
                    uglifyOptions: {
                        compress: {
                            warnings: false,
                            drop_console: true,
                            drop_debugger: false,
                            pure_funcs: ['console.log']//移除console
                        }
                    },
                    sourceMap: false,
                    parallel: true
                })
            );
            config.plugins = [
                ...config.plugins,
                ...plugins
            ];
        } else {
            /**
             * 为开发环境修改配置
             * 关闭host check，方便使用ngrok之类的内网转发工具
             */
            config.devServer = {
                disableHostCheck: true
            };
        }
    },

    chainWebpack: config => {
        // 修复 Lazy loading routes Error： Cyclic dependency
        config.plugin('html').tap(args => {
            args[0].chunksSortMode = 'none';
            return args;
        });
        // 修复HMR
        config.resolve.symlinks(true);
        /**
         * 配置全局变量
         */
        config.resolve.alias.set('@', resolve('src'))
        // 使用完整版本vue
        // vue$': 'vue/dist/vue.common'
            .set('vue$', 'vue/dist/vue.common');

        /**
         * 删除懒加载模块的 prefetch，降低带宽压力
         * https://cli.vuejs.org/zh/guide/html-and-static-assets.html#prefetch
         * 而且预渲染时生成的 prefetch 标签是 modern 版本的，低版本浏览器是不需要的
         */
        config.plugins.delete('prefetch');

        /**
         * 添加CDN参数到 htmlWebpackPlugin 配置中
         */
        config.plugin('html').tap(args => {
            args[0].template = 'src/index.html';
            if (process.env.NODE_ENV === 'production') {
                args[0].cdn = cdn.build;
            }
            if (process.env.NODE_ENV === 'development') {
                args[0].cdn = cdn.dev;
            }
            return args;
        });

        /**
         * 无需使用@import在每个scss文件中引入变量或者mixin，也可以避免大量@import导致build变慢
         * sass-resources-loader 文档链接：https://github.com/shakacode/sass-resources-loader
         */
        const oneOfsMap = config.module.rule('less').oneOfs.store;
        const sassResources = ['var.less', 'reset.less', 'common.less', 'px2rem.less']; // less资源文件，可以在里面定义变量，mixin,全局混入样式等
        oneOfsMap.forEach(item => {
            item
                .use('sass-resources-loader')
                .loader('sass-resources-loader')
                .options({
                    resources: sassResources.map(file => path.resolve(__dirname, 'src/assets/style/' + file))
                }).end();
        });

        /**
         * 调整内联图片大小为10M
         */
        config.module.rule('images').use('url-loader').loader('url-loader')
            .tap(options => Object.assign(options, {limit: 10240}));

        /**
         * svg图片
         */
        let svgRule = config.module.rule('svg');
        svgRule.uses.clear();
        svgRule.use('vue-svg-loader').loader('vue-svg-loader');

        // 打包分析
        if (process.env.IS_ANALYZ) {
            config.plugin('webpack-report')
                .use(BundleAnalyzerPlugin, [{
                    analyzerMode: 'static',
                }]);
        }
    },
    // 第三方插件
    pluginOptions: {
        prerenderSpa: {
            registry: undefined,
            renderRoutes: [
                '/'
            ],
            useRenderEvent: true,
            headless: true,
            onlyProduction: true,
            postProcess: route => {
                // Defer scripts and tell Vue it's been server rendered to trigger hydration
                route.html = route.html
                    .replace(/<script (.*?)>/g, '<script $1 defer>')
                    .replace('id="app"', 'id="app" data-server-rendered="true"');
                return route;
            }
        }
    },
    // 配置 webpack-dev-server 行为。
    devServer: {
        port: 8888,
        https: false,
        hotOnly: false,
        // 查阅 https://github.com/vuejs/vue-docs-zh-cn/blob/master/vue-cli/cli-service.md#配置代理
        proxy: {
            "/api": {
                target: "https://zsccyun.sf.kmzscc.com/index.php",
                ws: true,
                changeOrigin: true,
                pathRewrite: {"^/api": "/api"}
            }
        }
    }
};
