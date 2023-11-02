const aggregate = [
    {
      '$match': { 'status': "PAID" },
      
    },
    {
      '$group': {
        '_id': "$organizationId", 
        'count': { '$sum': 1 }, 
        'documents': { '$push': "$$ROOT" } 
      }
    },
    {
      '$match': { 'count': 1 } 
    },
    {
      '$replaceRoot': { 'newRoot': { '$arrayElemAt': ["$documents", 0] } } 
    },
    {
        '$lookup':{
            'from':'organizations',
            'localField':'organizationId',
            'foreignField':'_id',
            'as':'organizations'
        }
    },
    {
        '$unwind':'$organizations'
    },
    {
        '$match':{
            'organizations.status':'ACTIVE',
            'organizations._id':{'$ne':'org20191010594d821f'}
        }
    },
    {
        '$addFields':{
            'databaseURI':'$organizations.databaseURI',
            'organizationName':'$organizations.name',
            'domain':'$organizations.subDomain',
            'orgPlanName':'$product.name',
            'orgDatabaseName':'$organizations.databaseName',
            'totalAmount':'$order.totalAmount',
            'orgCreationDate':'$organizations.creationDate'
        }
    },
    {
        '$lookup':{
            'from':'users',
            'localField':'organizationId',
            'foreignField':'organization.id',
            'as':'users',
            'pipeline':[
                {
                    '$project':{
                        '_id':1,
                        'email':1
                    }
                }
            ]
        }
    }
];


module.exports = {aggregate};