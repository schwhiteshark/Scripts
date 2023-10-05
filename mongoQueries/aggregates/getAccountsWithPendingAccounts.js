
function getAccountsWithPendingAccounts(serviceType){
    return [
        {
            '$match':{
                'accounts.accountId':{'$regex':serviceType,'$options':'i'},
                'accounts.status':{'$ne':'DONE'}
            }
        },
        {
            '$unwind':'$accounts'
        },
        {
            '$match':{
                'accounts.accountId':{'$regex':serviceType,'$options':'i'},
                'accounts.status':{'$ne':'DONE'}
            }
        },
        {
            '$project':{
                'accountId':'$accounts.accountId',
                'serviceId':'$accounts.serviceId',
                'status':'$accounts.status',
                'lastUpdate':'$lastUpdate',
                'reportId':'$reportId'
            }
        }
    ];
}

module.exports = {getAccountsWithPendingAccounts};