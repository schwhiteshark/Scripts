
function getMetrics(collection,entityId,segment,startDate,endDate){

    let query = {
        'collection':collection,
        'entityId':entityId,
        'segment':segment
    }

    if(segment == 'Date'){
        query.segmentValue = {
            '$gte':startDate.toString(),
            '$lte':endDate.toString()
        }
    }

    return query;
}

module.exports = {getMetrics}