//library imports
require('dotenv').config();
//local imports
const {DocumentManager} =  require('./utils/DocumentManager.js');
const { outputError , outputInformative } = require('./utils/ConsoleUtils.js');
const {CSVConverter} = require('./utils/CSVConverter.js');
//mongo query
const {aggregate} = require('./mongoQueries/aggregates/getActiveUsersGroupedByOrg');
//reading dot env variable
mongoDBInsightsCoreURL = process.env.MONGODB_INSIGHTS_CORE || "";

const main = async() => {

    let output = [];
    const coreDocumentManager = new DocumentManager(mongoDBInsightsCoreURL,"insights_core");
    const securityDocumentManager = new DocumentManager(mongoDBInsightsCoreURL,"security_core");

    try{

        await coreDocumentManager.connect();
        await securityDocumentManager.connect();
        let organizations = await coreDocumentManager.aggregate("payment_settings",aggregate);

        for( const organization of organizations){
            let organizationDocumentManager = new DocumentManager(organization.databaseURI,organization.orgDatabaseName);

            try{

                await organizationDocumentManager.connect();
                outputInformative(`${organization.organizationName}`);
                for( const user of organization.users){
                    let query = {'type':{'$regex':'sm','$options':'i'},'creationUser':user._id.toString(),'status':'ACTIVE'};
                    let service = await organizationDocumentManager.findAll('services',query,true);

                    if(service.length>=1){
                        let users = await coreDocumentManager.findAll('users',{'organization.id':organization.organizationId,'status':'ACTIVE','roles':'ROLE_ORG_ADMIN'});
                        for( u of users){
                            let data = {
                                'Org Name':organization.organizationName,
                                'Org Creation Date':organization.orgCreationDate,
                                'Email':u.email,
                                'First Name':u.firstName,
                                'Last Name':u.lastName
                            };
                            output.push(data);
                        }

                        break;
                    }
                }

            }catch(e){
                outputError(e);
            }finally{
                await organizationDocumentManager.closeConnection();
            }
        }

        
        new CSVConverter().writeCSVFile(`users_with_super_metrics_service.csv`,output);

    }catch(e){
        outputError(e);
    }finally{
        await coreDocumentManager.closeConnection();
        await securityDocumentManager.closeConnection();
    }    

}

main();