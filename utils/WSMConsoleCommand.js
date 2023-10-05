const execSync = require('child_process').execSync;

class WSMCommand {
    constructor() {
        this.command = "/opt/wsm/console/wsmconsole";
        this.downloadArgument = "download.account.complete.data";
    }
    getDownloadAccountData(orgId, serviceId, accountId, reportId) {
        return `${this.command} ${this.downloadArgument} -o ${orgId} -s ${serviceId} -a ${accountId} -r ${reportId}`;
    }

    executeCommand(command) {
        execSync(command,{stdio: 'inherit'});
    }

}

module.exports = {WSMCommand};