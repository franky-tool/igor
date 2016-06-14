

var program = require('commander')
  , configData = require('./baseConfig.js')
  , chalk = require('chalk')
  , fs = require('fs')
  ;

function makeFolder(path, cb) {
  fs.mkdir(path,function(e){
    if(!e || (e && e.code === 'EEXIST')){
      if (!!cb) {
        cb(null);
      }
    } else {
      if (!!cb) {
        cb(e);
      }
    }
  });
}

function getVariableFromParser(parser, prompt, name, defaultValue) {
  defaultValue = defaultValue || "";
  var variable = parser[name];
  if(parser.verbose){
    console.log(chalk.cyan("\nGetting ")+chalk.yellow(prettyfyWord(name)));
  }
  if (!!parser.interactive && !variable) {
    var dv = " ["+defaultValue+"]";
    variable = prompt(chalk.gray(prettyfyWord(name)+dv+": "));
    if(variable===null){
      console.error("Cancelled by user.");
      process.exit(-1);
    }
  }
  variable = variable || defaultValue;
  if(parser.verbose){
    console.log(chalk.cyan("Final value for ")+chalk.yellow(prettyfyWord(name))+chalk.cyan(" are ")+chalk.green("'"+variable+"'"));
  }
  return variable;
}

function increaseVerbosity(v, total) {
  return total + 1;
}

function prettyfyWord(word) {
  return word.replace(/([A-Z])/g, ' $1')
    .replace(/^./, function(str){ return str.toUpperCase(); });
}

module.exports = {
  prettyfyWord: prettyfyWord,
  increaseVerbosity: increaseVerbosity,
  getVariableFromParser: getVariableFromParser,
  makeFolder: makeFolder
}

