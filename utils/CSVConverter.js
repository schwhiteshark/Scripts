const fs = require('fs');
let converter = require('json-2-csv');

class CSVConverter {
    constructor() {
        this.outputFolder = './output/';
    }

    createFolderIfNotExists(){
        !fs.existsSync(this.outputFolder) && fs.mkdirSync(this.outputFolder, { recursive: true });
    }

    async getCSV(jsonData) {
        return await converter.json2csv(jsonData);
    }

    async writeCSVFile(fileName,jsonData) {
        this.createFolderIfNotExists();
        let csv = await converter.json2csv(jsonData);
        fs.writeFile(`${this.outputFolder}/${fileName}`, csv, function (err) {
            if (err) {
                return console.log(err);
            }
        });
    }
}

module.exports = {CSVConverter}