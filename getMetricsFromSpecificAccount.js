//library imports
require('dotenv').config();
const {DateTime} = require('luxon');
//local imports
const {DocumentManager} =  require('./utils/DocumentManager.js');
const {outputWarning , outputError , outputInformative , outputMessage} = require('./utils/ConsoleUtils.js');
const {CSVConverter} = require('./utils/CSVConverter.js');
const {WSMCommand} = require('./utils/WSMConsoleCommand.js');
const {GenerateRunnableScript} = require('./utils/GenerateRunnableScript.js');
//Mongo queries
const {getMetrics} = require('./mongoQueries/queries/getMetricsBySegmentQuery.js');
//yargs declaration
var argv = require('yargs/yargs')(process.argv.slice(2))
    .option('organizationId', {
        alias: 'orgId',
        demandOption: true,
        describe: 'Collection Name',
        type: 'string'
    })
    .option('collection', {
        alias: 'c',
        default:'service_accounts',
        demandOption: false,
        describe: 'Collection Name',
        type: 'string'
    })
    .option('startDate', {
        alias: 'std',
        demandOption: false,
        describe: 'start date, default value: today at 00:00:00',
        type: 'string'
    })
    .option('endDate', {
        alias: 'ste',
        demandOption: false,
        describe: 'End Date, default value : today at 23:59:59',
        type: 'string'
    })
    .option('segment', {
        alias: 'seg',
        default:'Date',
        demandOption: false,
        describe: 'Segment Name',
        type: 'string'
    })
    .option('accountId', {
        alias: 'a',
        demandOption: true,
        describe: 'Account Id',
        type: 'string'
    }    
    )
    .argv;

//reading dot env variable
mongoDBInsightsCoreURL = process.env.MONGODB_INSIGHTS_CORE || "";

const main = async() => {

    let organizationId = argv.organizationId;
    let collection = argv.collection;
    let segment = argv.segment;
    let accountId = argv.accountId;
    let startDate = argv.startDate ? DateTime.fromISO(argv.startDate) : DateTime.now().startOf('day');
    let endDate = argv.endDate ? DateTime.fromISO(argv.endDate) : DateTime.now().endOf('day');

    const coreDocumentManager = new DocumentManager(mongoDBInsightsCoreURL,"insights_core");
    await coreDocumentManager.connect();

    try{
        
        let organization = await coreDocumentManager.findOne("organizations",{'_id':organizationId},true);

        if(!organization){
            return;
        }

        organizationDocumentManager = new DocumentManager(organization.databaseURI,organization._id);
        await organizationDocumentManager.connect();

        let metrics = await organizationDocumentManager.findAll("sa_metrics",getMetrics(collection,accountId,segment,startDate,endDate));

        if(metrics.length == 0){
            outputInformative("No Metrics for the specified timeframe");
            organizationDocumentManager.closeConnection();
            return ;
        }

        new CSVConverter().writeCSVFile(`${organizationId}_${accountId}_metrics.csv`,metrics);
        organizationDocumentManager.closeConnection();

    }catch(e){
        outputError(e);
    }finally{
        coreDocumentManager.closeConnection();
    }

};

main();