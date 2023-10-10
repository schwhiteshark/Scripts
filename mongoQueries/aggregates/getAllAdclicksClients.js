const paidClientAggregate = [
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
            'organizations.status':'ACTIVE'
        }
    },
    {
        '$addFields':{
            'databaseURI':'$organizations.databaseURI',
            'organizationName':'$organizations.name',
            'domain':'$organizations.subDomain',
            'orgPlanName':'$product.name',
            'orgDatabaseName':'$organizations.databaseName',
            'totalAmount':'$order.totalAmount'
        }
    },
    {
        '$project':{
            'organizations':0,
            'product':0,
            'order':0
        }
    }
];

module.exports = {paidClientAggregate}