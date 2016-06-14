
var config = {
    "port": 9090,
    "sources":"src",
    "statics": "public",
    "plugins": "plugins",
    "templates": ["templates"],
    "controllers": "controllers",
    "database": {
        name: "data"
    },
    "generation":{
      "port": 6783,
      "targetFolder":"_site"
    },
    "sep": "/",
    "ignore_prefix": "__",
    "preprocessor": "sass",
    "tags": {
      blockStart: '{%',
      blockEnd: '%}',
      variableStart: '{{',
      variableEnd: '}}',
      commentStart: '<!--',
      commentEnd: '-->'
    },
    "autoreload": "browsersync"
}

module.exports = config;

