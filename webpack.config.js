import path from 'path';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default (env, argv) => {
  const isStandalone = process.env.STANDALONE === 'true';
  
  return {
    entry: isStandalone ? './client/src/standalone.tsx' : './client/src/main.tsx', // Punto de entrada adaptado
    output: {
      filename: 'erp360-auth.js', // Nombre del microfrontend
      libraryTarget: isStandalone ? 'var' : 'system', // system para single-spa, var para standalone
      path: path.resolve(__dirname, 'dist'),
      publicPath: 'http://localhost:8083/', // Puerto único para este microfrontend
    },
    mode: 'development',
    devServer: {
      port: 8083, // Puerto diferente al de tu sidebar
      headers: {
        'Access-Control-Allow-Origin': '*', // CORS para el root-config
      },
      historyApiFallback: true,
      hot: true,
      static: {
        directory: path.join(__dirname, 'client'),
      },
    },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              '@babel/preset-env',
              '@babel/preset-react',
              '@babel/preset-typescript'
            ]
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './client/index.html',
      filename: 'index.html',
    }),
  ],
    externals: isStandalone ? [] : ['react', 'react-dom', 'single-spa', 'single-spa-react'], // Dependencias compartidas solo en modo single-spa
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': path.resolve(__dirname, 'client/src'),
        '@shared': path.resolve(__dirname, 'shared'),
        '@assets': path.resolve(__dirname, 'attached_assets'),
      },
    },
  };
};