//library imports
require('dotenv').config();
//local imports
const {DocumentManager} =  require('./utils/DocumentManager.js');
const {outputWarning , outputError , outputInformative , outputMessage} = require('./utils/ConsoleUtils.js');
const {CSVConverter} = require('./utils/CSVConverter.js');
const {WSMCommand} = require('./utils/WSMConsoleCommand.js');
const {GenerateRunnableScript} = require('./utils/GenerateRunnableScript.js');
//mongo queries
const {getAccountsWithPendingAccounts} = require('./mongoQueries/aggregates/getAccountsWithPendingAccounts.js');
//code yargs
//const { hideBin } = require('yargs/helpers')
var argv = require('yargs/yargs')(process.argv.slice(2))
    .option('organizationId', {
        alias: 'orgId',
        demandOption: true,
        describe: 'Organization Id',
        type: 'string'
    })
    .option('provider', {
        alias: 'p',
        demandOption: true,
        describe: 'Service Type, ex: adwords,bing etc',
        type: 'string'
    })
    .option('accountId', {
        alias: 'a',
        demandOption: false,
        describe: 'If you want to generate an output if a specific account, you can add account Id',
        type: 'string'
    })
    .argv;
//reading dot env variable
mongoDBInsightsCoreURL = process.env.MONGODB_INSIGHTS_CORE || "";

const main = async () => {

    let organizationId = argv.orgId;
    let serviceType = argv.provider;
    let accountId = argv.accountId;

    if(!organizationId || !serviceType){
        outputWarning("Parameters have not been provided. example: node checkPendingAccountsRetryDownload.js --orgId={orgId} provider={serviceType}");
        return;
    }

    const coreDocumentManager = new DocumentManager(mongoDBInsightsCoreURL,"insights_core");
    await coreDocumentManager.connect();

    try{
        organization = await coreDocumentManager.findOne("organizations",{'_id':organizationId},true);
        
        if(!organization){
            return;
        }

        organizationDocumentManager = new DocumentManager(organization.databaseURI,organization._id);
        await organizationDocumentManager.connect();

        if(!serviceType){
            outputWarning("Service Type has not been provided. ex: adwords,facebook-ads,bing,etc...");
            await organizationDocumentManager.closeConnection();
            return;
        }
        
        let downloadAccountData = await organizationDocumentManager.aggregate("report_download_configuration",getAccountsWithPendingAccounts(serviceType));
        
        if(downloadAccountData.length == 0){
            outputMessage("There are not Pending Accounts with the service provided");
            outputInformative(`Service Type: ${serviceType}`)
        }
        
        //in order to get uniques commands
        commandSet = new Set();

        downloadAccountData.forEach(accountData => {
                let command  = new WSMCommand().getDownloadAccountData(organizationId,accountData.serviceId,accountData.accountId,accountData.reportId);
                accountData.downloadCommand = command;
                commandSet.add(command);
        });
        
        if(accountId){
            downloadAccountData = downloadAccountData.filter((element) => {element.accountId === accountId});
        }

        new CSVConverter().writeCSVFile(`${organizationId}_pending_accounts_report.csv`,downloadAccountData);
        //generate runnable script
        //'./templates/runCommandTemplate.js'
        new GenerateRunnableScript().generateScriptFile(Array.from(commandSet));
        await organizationDocumentManager.closeConnection();

    }catch(e){
        outputError(e);
    }finally{
        await coreDocumentManager.closeConnection();
    }
}

main();