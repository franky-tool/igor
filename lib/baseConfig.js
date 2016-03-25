
var config = {
  port: 9090,
  app: "app",
  sources: "src",
  statics: "public",
  generated: "_site",
  ignore_prefix: "__",
  run_file: "index.js",
  generation_port: 6785,
  templates: "templates",
  data_url_prefix: "api",
  data_folder: "data",
  controllers: "controllers",
  preprocessor: "sass",
  sep: '/',
  tags: {
      blockStart: '{%',
      blockEnd: '%}',
      variableStart: '${',
      variableEnd: '}',
      commentStart: '<!--',
      commentEnd: '-->'
  }
}

module.exports = config;

