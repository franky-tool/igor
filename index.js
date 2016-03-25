#!/usr/bin/env node --harmony

var program = require('commander')
  , packageData = require('./lib/basePackage.js')
  , configData = require('./lib/baseConfig.js')
  , utils = require('./lib/utils.js')
  , prompt = require('prompt-sync')({
      history: require('prompt-sync-history')()
    })
  , chalk = require('chalk')
  , fs = require('fs')
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
  .option('-p, --preprocessor <preprocessor>', 'The style preprocessor for project.')
  .option('-o, --data-folder <data_folder>', 'Data folder name for project.')
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
      ;

    packageData.name = project_name.toLowerCase();
    packageData.description = description;

    configData.preprocessor = preprocessor.toLowerCase();
    configData.app = appFolder.toLowerCase();
    configData.sources = sourcesFolder.toLowerCase();
    configData.statics = staticsFolder.toLowerCase();
    configData.templates = templatesFolder.toLowerCase();
    configData.controllers = controllersFolder.toLowerCase();
    configData.data_folder = dataFolder.toLowerCase();
    configData.generated = generatedFolder.toLowerCase();

    console.log(chalk.gray("Creating ")+chalk.bold.yellow(project_name));
    var target = process.cwd()+"/"+project_name;
    makeFolder(target, function createFolder(err) {
      if(err) {
          return console.log(err);
      }
			makeFolder(target+"/"+configData.app, function createFolder(err) {
        if(err) {
            return console.log(err);
        }
        makeFolder(target+"/"+configData.app+"/"+configData.sources);
        makeFolder(target+"/"+configData.app+"/"+configData.sources+"/js");
        makeFolder(target+"/"+configData.app+"/"+configData.sources+"/styles");
        makeFolder(target+"/"+configData.app+"/"+configData.templates);
        makeFolder(target+"/"+configData.app+"/"+configData.statics);
        makeFolder(target+"/"+configData.app+"/"+configData.controllers);
				fs.writeFile(target+"/"+configData.app+"/"+configData.templates+"/index.html", htmlFile);
				fs.writeFile(target+"/"+configData.app+"/"+configData.sources+"/js/sample.js", "// Sample file");
				fs.writeFile(target+"/"+configData.app+"/"+configData.sources+"/styles/sample.scss", "// Sample file");
				fs.writeFile(target+"/index.js", indexFile.replace('<$>', configData.app), function (err) {
          fs.writeFile(target+"/gulpfile.js", gulpFile.replace('<$>', configData.app), function (err) {
            fs.writeFile(target+"/package.json", JSON.stringify(packageData, null, 2), function (err) {
              if(err) {
                  return console.log(err);
              }
              makeFolder(target+"/"+configData.app, function(err) {
                if(err) {
                    return console.log(err);
                }
                var data = "\nvar config = "+JSON.stringify(configData, null, 2)+"\n\nmodule.exports = config;";
                fs.writeFile(target+"/"+configData.app+"/config.js", data, function(err) {
                  if(err) {
                      return console.log(err);
                  }
                  prompt.history.save();
                  console.log("Project is created!");
                });
              });
            });
          });
				});
			});

    });
  })
  .parse(process.argv);

if (!GLOBAL.project_name) {
  console.error("Invalid project name. Use "+chalk.green("'igor -h'")+" to get help.");
  process.exit(-1);
}

