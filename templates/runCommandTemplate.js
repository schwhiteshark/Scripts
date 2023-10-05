const execSync = require('child_process').execSync;

const commands = [];

commands.forEach( command => {
  execSync(command,{stdio: 'inherit'});
});
