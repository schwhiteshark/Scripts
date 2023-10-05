const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

const fileId = uuidv4().toString().substring(0,6);


class GenerateRunnableScript{

    constructor(){}

    generateScriptFile(commands){
        fs.readFile('./templates/runCommandTemplate.js', 'utf8', (err, data) => {
            if (err) {
              console.error('Error reading template file:', err);
              return;
            }
          
            // Replace the 'commands' array in the template with the newCommands array.
            const modifiedData = data.replace(/const commands = \[\];/, `const commands = ${JSON.stringify(commands)};`);
          
            // Create a new JavaScript file with the modified code.
            fs.writeFile(`./output/generatedScript_${fileId}.js`, modifiedData, 'utf8', (err) => {
              if (err) {
                console.error('Error writing new file:', err);
              } else {
                console.log('New JavaScript file (generatedScript.js) created successfully.');
              }
            });
          });
    }

}

module.exports = {GenerateRunnableScript};