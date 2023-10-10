print("Starting process run modification... ");

//Find all orgs
var organizations = db.organizations.find({"_id":{"$ne":"org20191010594d821f"}, "status":"ACTIVE"});

var orgCount = 1;

organizations.forEach(function(org) {
    var orgdb = db.getSiblingDB(org._id);

    print("Processing org "+orgCount+"/"+organizations.count());

    orgdb.process_run.updateMany({"status":{"$in":["PENDING","RUNNING","QUEUE"]}},{"$set":{"status":"DONE"}});

    orgdb.report_download_configuration.updateMany(
        {"accounts.status":{"$in":["PENDING","RUNNING","QUEUE"]}},
        { "$set": { "accounts.$.status" : "DONE" } }
        );

    orgCount++;
});

print("Finished process run modification...");