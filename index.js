#!/usr/bin/env node --harmony

var program = require('commander')
  , packageData
  , configData = require('./lib/baseConfig.js')
  , utils = require('./lib/utils.js')
  , prompt = require('prompt-sync')({
      history: require('prompt-sync-history')()
    })
  , async = require('async')
  , chalk = require('chalk')
  , fs = require('fs')
  , cp = require('child_process')
  , exec = cp.exec
  , spawn = cp.spawn
  ;


var prettyfyWord = utils.prettyfyWord
  , increaseVerbosity = utils.increaseVerbosity
  , htmlFile = utils.htmlFile
  , indexFile = utils.indexFile
  , gulpFile = utils.gulpFile
  , getVariableFromParser = utils.getVariableFromParser
  , makeFolder = utils.makeFolder
  ;

program
  .arguments('<project_name>')
  .option('-a, --app-folder <app_folder>', 'Application folder name for project.')
  .option('-c, --controllers-folder <controllers_folder>', 'Controllers folder name for project.')
  .option('-d, --project-description <project_description>', 'The description for project.')
  .option('-g, --generated-folder <generated_folder>', 'Generated files folder name for project.')
  .option('-i, --interactive', 'Fill lost data interactively.')
  .option('-o, --data-folder <data_folder>', 'Data folder name for project.')
  .option('-p, --preprocessor <preprocessor>', 'The style preprocessor for project.', /^(sass|less|stylus)$/, 'sass')
  .option('-s, --sources-folder <sources_folder>', 'Sources folder name for project.')
  .option('-t, --templates-folder <templates_folder>', 'Templates folder name for project.')
  .option('-u, --statics-folder <statics_folder>', 'Statics folder name for project.')
  .option('-v, --verbose', 'Verbose output of asistant actions.', increaseVerbosity, 0)
  .action(function parserAction(project_name) {
    GLOBAL.project_name = project_name;
    if(!!program.verbose){
      console.log(chalk.green("Verbose output:"), !!program.verbose);
      console.log(chalk.green("Interactive mode:"), !!program.interactive);
    }
    var preprocessor = getVariableFromParser(program, prompt,'preprocessor', 'sass')
      , appFolder = getVariableFromParser(program, prompt,'appFolder', 'app')
      , description = getVariableFromParser(program, prompt,'projectDescription', 'Yet another super project!!!.')
      , sourcesFolder = getVariableFromParser(program, prompt,'sourcesFolder', 'src')
      , staticsFolder = getVariableFromParser(program, prompt,'staticsFolder', 'public')
      , templatesFolder = getVariableFromParser(program, prompt,'templatesFolder', 'templates')
      , controllersFolder = getVariableFromParser(program, prompt,'controllersFolder', 'controllers')
      , generatedFolder = getVariableFromParser(program, prompt,'generatedFolder', '_site')
      , dataFolder = getVariableFromParser(program, prompt,'dataFolder', 'data')
      , VERBOSE = getVariableFromParser(program, prompt,'verbose', false)
      ;

    configData.preprocessor = preprocessor.toLowerCase();
    configData.app = appFolder.toLowerCase();
    configData.sources = sourcesFolder.toLowerCase();
    configData.statics = staticsFolder.toLowerCase();
    configData.templates = templatesFolder.toLowerCase();
    configData.controllers = controllersFolder.toLowerCase();
    configData.database.name = dataFolder.toLowerCase();
    configData.generation.targetFolder = generatedFolder.toLowerCase();

    console.log(chalk.gray("Creating ")+chalk.bold.yellow(project_name));
    var target = process.cwd()+"/"+project_name;
    async.waterfall([
      function cloneRepo(callback){
        exec("git clone https://github.com/franky-tool/franky "+target, callback);
      },
      function updateSubmodules(error, stdout, stderr, callback){
        if(!!arguments[3]){
          console.error(chalk.red('Error creating module:' + error.message));
          process.exit(-1);
        }
        exec('cd '+target+'; git submodule update --init; git submodule foreach git pull origin master; rm -Rf .git', arguments[2]);
      },
      function moveSources(error, stdout, stderr, callback){
        VERBOSE&&console.log(""+stdout);
        var packagePath = [target,'package.json'].join('/');
        packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
        packageData.name = project_name.toLowerCase();
        packageData.description = description;
        if(!!arguments[3]){
          console.error(chalk.red('Error updating submodules:' + error.message));
          console.log(chalk.red(""+stdout));
          process.exit(-1);
        }
        VERBOSE&&console.log(chalk.cyan('Base project is created'));
        if(sourcesFolder==='src'){
          return arguments[arguments.length-1]();
        }
        exec('mv '+target+'/app/src '+target+'/app/'+sourcesFolder, arguments[2]);
      },
      function moveTemplates(error, stdout, stderr, callback){
        VERBOSE&&console.log(""+stdout);
        if(!!arguments[3]){
          console.error('Error updating sources:' + chalk.red(error.message));
          process.exit(-1);
        }
        VERBOSE&&console.log(chalk.cyan('sources created'));
        if(templatesFolder==='templates'){
          return arguments[arguments.length-1]();
        }
        exec('mv '+target+'/app/templates '+target+'/app/'+templatesFolder, arguments[2]);
      },
      function moveControllers(error, stdout, stderr, callback){
        if(!!arguments[3]){
          console.error('Error updating templates:' + chalk.red(error.message));
          process.exit(-1);
        }
        VERBOSE&&console.log(chalk.cyan('templates created'));
        if(controllersFolder==='controllers'){
          return arguments[arguments.length-1]();
        }
        exec('mv '+target+'/app/controllers '+target+'/app/'+controllersFolder, arguments[2]);
      },
      function moveAppFolder(error, stdout, stderr, callback){
        if(!!arguments[3]){
          console.error('Error updating controllers:' + chalk.red(error.message));
          process.exit(-1);
        }
        VERBOSE&&console.log(chalk.cyan('controllers created'));
        if(configData.app==='app'){
          return arguments[arguments.length-1]();
        }
        exec('mv '+target+'/app '+target+'/'+configData.app, arguments[2]);
      },
      function(error, stdout, stderr, callback){
        if(!!arguments[3]){
          console.error(chalk.red(error.message));
          process.exit(-1);
        }
        VERBOSE&&console.log(chalk.cyan('files ready'));
        var data = "\nvar config = "+JSON.stringify(configData, null, 2)+"\n\nmodule.exports = config;";
        fs.writeFile(target+"/"+configData.app+"/config.js", data, arguments[2]||arguments[0]);
      },
      function (error, callback) {
        if(!!arguments[1]) {
            return console.log(error);
        }
        VERBOSE&&console.log(chalk.cyan('configuration updated'));
        fs.writeFile(target+"/package.json", JSON.stringify(packageData, null, 2), arguments[0]);
      },
      function (error, callback) {
        if(!!arguments[1]) {
            return console.log(error);
        }
        VERBOSE&&console.log(chalk.cyan('package updated'));
        callback = arguments[0];
        fs.readFile(target + '/gulpfile.js', function (err, data) {
          data = (''+data).replace(/\/app/g, '/'+configData.app);
          fs.writeFile(target+"/gulpfile.js", data, callback);
        });
      },
      function (error, callback) {
        if(!!arguments[1]) {
            return console.log(error);
        }
        VERBOSE&&console.log(chalk.cyan('gulpfile updated'));
        callback = arguments[0];
        fs.readFile(target + '/index.js', function (err, data) {
          data = (''+data).replace(/\'app\'/g, '\''+configData.app+'\'');
          fs.writeFile(target+"/index.js", data, callback);
        });
      },
      function(callback) {
        VERBOSE&&console.log(chalk.cyan('configuration created'));
        prompt.history.save();
        callback();
      },
      function updateGitRepo(callback){
        exec('cd '+target+'; git init . ; git add . ; git commit --author="Igor <igor@franky-tool.org>" -m "first commit" ', arguments[2]);
        VERBOSE&&console.log(chalk.cyan('Repository initialized...'));
        callback();
      }
    ], function(){
      console.log(chalk.green('Done!!!'));
    });
  })
  .parse(process.argv);

if (!GLOBAL.project_name) {
  console.error('Invalid project name. Use '+chalk.green('"igor -h"')+' to get help.');
  process.exit(-1);
}

