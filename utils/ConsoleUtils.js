const chalk = require('chalk');


function outputError(message=""){
    console.log(chalk.red(message));
}

function outputWarning(message=""){
    console.log(chalk.yellow(message));
}

function outputInformative(message=""){
    console.log(chalk.cyan(message));
}

function outputTable(data={}){
    console.table(data);
}

function outputMessage(message){
    console.log(chalk.bold(message));
}

module.exports = {outputError,outputWarning,outputInformative,outputTable,outputMessage}