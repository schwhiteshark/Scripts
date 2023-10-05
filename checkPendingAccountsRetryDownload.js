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
//code args
const args = process.argv.slice(2);

//reading dot env variable
mongoDBInsightsCoreURL = process.env.MONGODB_INSIGHTS_CORE || "";

const main = async () => {

    if(args.length == 0){
        outputWarning("Parameters have not been provided. example: node checkPendingAccountsRetryDownload.js {orgId} {serviceType}");
        return;
    }

    let organizationId = args[0];
    let serviceType = args[1];

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