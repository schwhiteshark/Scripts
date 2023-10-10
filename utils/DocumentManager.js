const { MongoClient , ObjectId } = require('mongodb');
const chalk = require('chalk');

class DocumentManager{

    constructor(databaseUrl,databaseName){
        this.url = databaseUrl;
        this.databaseName = databaseName;
        this.isConnectionOpen = false;
        this.client = new MongoClient(this.url);
    }

    async connect() {
        if (this.isConnectionOpen) {
            console.log("A connection is already established");
        }
        else {
            try {
                // Use connect method to connect to the server
                await this.client.connect();
                console.log(chalk.green('Connected successfully to server'));
                this.isConnectionOpen = true;
                console.log(`Connecting to Database:`,chalk.yellow(`${this.databaseName}`));
                this.db = this.client.db(this.databaseName);
                console.log(chalk.green(`Connection successfully`));
            }
            catch (error) {
                console.error(chalk.error(error));
                throw error;
            }
        }
    }

    async closeConnection() {
        if (this.isConnectionOpen) {
            this.client.close();
            console.log("Close Connection to",chalk.yellow(`${this.databaseName}`));
            this.isConnectionOpen = false;
        }
        else {
            console.log(chalk.cyan("There is no open connections established"));
        }
    }

    async changSourceDatabase(db) {
        this.databaseName = db;
        this.db = this.client.db(db);
    }
    
    async findAll(collectionName, query = {}) {
        this.checkConnectionStatus();
        query = this.validateIdProperty(query);
        const collection = this.db.collection(collectionName);
        return await collection.find(query).toArray();
    }

    async findOne(collectionName, query = {},omitIdValidation=false) {
        this.checkConnectionStatus();
        if(!omitIdValidation){
            query = this.validateIdProperty(query);
        }
        const collection = this.db.collection(collectionName);
        return await collection.findOne(query);
    }

    async aggregate(collectionName,query = {}){
        this.checkConnectionStatus();
        const collection = this.db.collection(collectionName);
        return await collection.aggregate(query).toArray();
    }

    async checkConnectionStatus() {
        if (!this.isConnectionOpen) {
            throw new Error("There is no Connection established");
        }

        return true;
    }

    validateIdProperty(query) {
        if ("id" in query) {
            query["_id"] = new ObjectId(query["id"]);
            delete query["id"];
        }
        else if ("_id" in query) {
            query["_id"] = new ObjectId(query["_id"]);
        }
        return query;
    }

}

module.exports = {DocumentManager}