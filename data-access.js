// data-access.js file
const { MongoClient } = require('mongodb');
const dbName = 'custdb';
const baseUrl = "mongodb://127.0.0.1:27017";
const collectionName = "customers";
const connectString = `${baseUrl}/${dbName}`;

let collection;
let client;
let dbReady = null;

async function dbStartup() {
    client = new MongoClient(connectString);
    await client.connect();
    collection = client.db(dbName).collection(collectionName);
}

dbReady = dbStartup();

async function ensureDbReady() {
    if (dbReady) await dbReady;
}

async function getCustomers() {
    await ensureDbReady();
    try {
        const customers = await collection.find().toArray();
        return [customers, null];
    } catch (err) {
        console.error(err.message);
        return [null, err.message];
    }
}

async function addCustomer(newCustomer) {
    await ensureDbReady();
    try {
        const insertResult = await collection.insertOne(newCustomer);
        return ["success", insertResult.insertedId, null];
    } catch (err) {
        console.error(err.message);
        return ["fail", null, err.message];
    }
}

async function resetCustomers() {
    await ensureDbReady();
    const data = [
        { id: 0, name: "Mary Jackson", email: "maryj@abc.com", password: "maryj" },
        { id: 1, name: "Karen Addams", email: "karena@abc.com", password: "karena" },
        { id: 2, name: "Scott Ramsey", email: "scottr@abc.com", password: "scottr" }
    ];
    try {
        await collection.deleteMany({});
        await collection.insertMany(data);
        const customers = await collection.find().toArray();
        const message = `data was refreshed. There are now ${customers.length} customer records!`;
        return [message, null];
    } catch (err) {
        console.error(err.message);
        return [null, err.message];
    }
}

async function getCustomerById(id) {
    await ensureDbReady();
    try {
        const customer = await collection.findOne({ id: +id });
        if (!customer) {
            return [null, "invalid customer number"];
        }
        return [customer, null];
    } catch (err) {
        console.error(err.message);
        return [null, err.message];
    }
}

async function updateCustomer(updatedCustomer) {
    await ensureDbReady();
    try {
        const filter = { id: updatedCustomer.id };
        const setData = { $set: updatedCustomer };
        await collection.updateOne(filter, setData);
        return ["one record updated", null];
    } catch (err) {
        console.error(err.message);
        return [null, err.message];
    }
}

async function deleteCustomerById(id) {
    await ensureDbReady();
    try {
        const deleteResult = await collection.deleteOne({ id: +id });
        if (deleteResult.deletedCount === 0) {
            return [null, "no record deleted"];
        } else if (deleteResult.deletedCount === 1) {
            return ["one record deleted", null];
        } else {
            return [null, "error deleting records"];
        }
    } catch (err) {
        console.error(err.message);
        return [null, err.message];
    }
}

// Optional: for graceful shutdown
async function closeDb() {
    if (client) await client.close();
}

module.exports = {
    getCustomers,
    resetCustomers,
    addCustomer,
    getCustomerById,
    updateCustomer,
    deleteCustomerById,
    closeDb
};