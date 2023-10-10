//library imports
require('dotenv').config();
//local imports
const {DocumentManager} =  require('./utils/DocumentManager.js');
const { outputError , outputInformative } = require('./utils/ConsoleUtils.js');
const {CSVConverter} = require('./utils/CSVConverter.js');
//mongo query
const {paidClientAggregate} = require('./mongoQueries/aggregates/getAllAdclicksClients');
//reading dot env variable
mongoDBInsightsCoreURL = process.env.MONGODB_INSIGHTS_CORE || "";

const main = async() => {

    let output = [];
    const coreDocumentManager = new DocumentManager(mongoDBInsightsCoreURL,"insights_core");

    try{

        await coreDocumentManager.connect();
        let organizations = await coreDocumentManager.aggregate("payment_settings",paidClientAggregate);

        for( const organization of organizations){
            let organizationDocumentManager = new DocumentManager(organization.databaseURI,organization.orgDatabaseName);

            try{

                await organizationDocumentManager.connect();
                let clients = await organizationDocumentManager.findAll("clients",{'status':'ACTIVE'});

                for (const client of clients) {
                    let data = {
                        'Org Id':organization._id,
                        'Organization Name': organization.organizationName,
                        'Organization Plan Name': organization.orgPlanName,
                        'Organization Plan Amount': organization.totalAmount,
                        'Client Id': client._id,
                        'Client Name': client.name,
                        'Client Status': client.status,
                        'Client Website': client.website,
                        'Number of Service Account': client.serviceAccounts?.length ?? 0
                    };
                    
                    let query = {'status':'ACTIVE','companiesMatching.value':client._id.toString()};
                    let reports = await organizationDocumentManager.findAll("reports",query);
                    data.reportCount = reports?.length ?? 0;
                    output.push(data);
                }

            }catch(e){
                outputError(e);
            }finally{
                await organizationDocumentManager.closeConnection();
            }
        }

        
        new CSVConverter().writeCSVFile(`adclicks_clients_report.csv`,output);

    }catch(e){
        outputError(e);
    }finally{
        await coreDocumentManager.closeConnection();
    }    

}

main();