module.exports = {
  entry: {
    main: './main.js'
  },
  module: {
    rules: [
      {
        test:  /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: [[
              '@babel/plugin-transform-react-jsx',
              {
                pragma: 'ToyReact.createElement',
                pragmaFrag: 'ToyReact.Fragment'
              }
            ]]
          }
        }
      }
    ]
  },
  optimization: {
    minimize: false
  },
  mode: 'development'
}