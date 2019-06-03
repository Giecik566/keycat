require('dotenv').config()

const path = require('path')
const webpack = require('webpack')
const HtmlPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const CspPlugin = require('csp-html-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')
const git = require('./git')

const ROOT = path.resolve(__dirname, '..')
const {
  ORIGIN = 'http://localhost:3030',
  FIREBASE_API_KEY,
} = process.env

module.exports = async (_, { mode = 'development' }) => {
  const COMMIT_REF = process.env.COMMIT_REF || await git('rev-parse', 'HEAD')

  const PRODUCTION = mode !== 'development'
  const config = {
    entry: path.resolve(ROOT, 'src', 'client.tsx'),
    mode,
    devtool: PRODUCTION ? 'source-map' : 'cheap-source-map',
    output: {
      path: path.resolve('public'),
      publicPath: `/${COMMIT_REF.slice(0, 7)}/`,
      filename: `[hash].js`,
    },
    resolve: {
      modules: ['node_modules', path.resolve(ROOT, 'src')],
      extensions: ['.tsx', '.ts', '.js']
    },
    plugins: [
      !PRODUCTION && new webpack.HotModuleReplacementPlugin(),
      new HtmlPlugin({
        template: path.resolve(ROOT, 'src', 'client.html'),
        PRODUCTION,
        ORIGIN,
      }),
      // PRODUCTION && new BundleAnalyzerPlugin(),
      PRODUCTION && new webpack.HashedModuleIdsPlugin(),
      new webpack.DefinePlugin({
        COMMIT_REF: JSON.stringify(COMMIT_REF),
        MODE: JSON.stringify(mode),
        FIREBASE_API_KEY: JSON.stringify(FIREBASE_API_KEY),
      }),
      new CspPlugin({
        'base-uri': `'self'`,
        'object-src': `'none'`,
        'script-src': [
          `'self'`,
          `'strict-dynamic'`,
          `https://fonts.googleapis.com`,
          `https://www.googletagmanager.com`,
        ],
        'style-src': [
          `'self'`,
          `https://fonts.googleapis.com`,
          `'unsafe-inline'`,
        ],
      }, {
        nonceEnabled: {
          'style-src': false,
        }
      }),
      new CopyPlugin([
        { from: path.resolve(ROOT, 'static'), to: path.resolve(ROOT, 'public')}
      ])
    ].filter(Boolean),
    module: {
      rules: [
        { test: /\.tsx?$/, use: [{
          loader: 'ts-loader',
          options: {
            transpileOnly: true,
          }
        }]},
        {
          test: /\.svg$/,
          loader: 'react-svg-loader',
        },
        {
          test: /\.(png|jpg|gif|md)$/,
          loader: 'file-loader',
        },
      ],
    },
    externals: PRODUCTION ? {} : {
      react: 'React',
      'react-dom': 'ReactDOM',
    },
  }
  
  if (!PRODUCTION) {
    config.devServer = {
      hot: true,
      host: '0.0.0.0',
      port: 3030,
      historyApiFallback: true,
      contentBase: path.resolve(ROOT, 'public'),
    }
  }

  if (PRODUCTION) {
    config.optimization = {
      runtimeChunk: 'single',
      splitChunks: {
        // chunks: 'all',
        // maxInitialRequests: Infinity,
        // minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            chunks: 'all',
            priority: 1,
            maxSize: 120 * 1024,
          },
        },
      },
    }
  }

  return config
}
