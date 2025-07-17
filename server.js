// server.js file
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const da = require("./data-access");
const app = express();
const port = process.env.PORT || 4000;
const checkApiKey = require("./security").checkApiKey;
const getNewApiKey = require("./security").getNewApiKey;

pp.use(bodyParser.json());

// Set the static directory to serve files from
const staticDir = path.join(__dirname, 'public');
app.use(express.static(staticDir));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log("staticDir: " + staticDir);
});

// API key middleware
// function checkApiKey(req, res, next) {
//     const apiKey = req.header('x-api-key');
//     if (!apiKey || apiKey !== process.env.API_KEY) {
//         return res.status(401).json({ error: 'Unauthorized: Invalid or missing API key' });
//     }
//     next();
// }

// /customers/find is open to all
app.get("/customers/find", async (req, res) => {
    const allowedFields = ["id", "email", "password"];
    const queryKeys = Object.keys(req.query);

    if (queryKeys.length === 0) {
        return res.status(400).json({ message: "query string is required" });
    }
    if (queryKeys.length > 1) {
        return res.status(400).json({ message: "only a single name/value pair is supported" });
    }
    const field = queryKeys[0];
    const value = req.query[field];
    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: "name must be one of the following (id, email, password)" });
    }
    let filter = {};
    if (field === "id") {
        filter.id = +value;
    } else {
        filter[field] = value;
    }
    const [customers, err] = await da.getCustomers();
    if (err) {
        return res.status(500).json({ error: err });
    }
    const matches = customers.filter(cust => cust[field] === filter[field]);
    if (matches.length === 0) {
        return res.status(404).json({ message: "no matching customer documents found" });
    }
    res.json(matches);
});

// Apply API key middleware to all routes below
// app.use(checkApiKey);

// Get all customers
app.get("/customers", async (req, res) => {
    const [cust, err] = await da.getCustomers();
    if (cust) {
        res.json(cust);
    } else {
        res.status(500).json({ error: err });
    }
});

// Reset customers
app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if (result) {
        res.json({ message: result });
    } else {
        res.status(500).json({ error: err });
    }
});

// Add a new customer
app.post('/customers',checkApiKey, async (req, res) => {
    const newCustomer = req.body;
    if (!newCustomer || Object.keys(newCustomer).length === 0) {
        return res.status(400).json({ error: "Missing request body" });
    }
    const [status, id, errMessage] = await da.addCustomer(newCustomer);
    if (status === "success") {
        res.status(201).json({ ...newCustomer, _id: id });
    } else {
        res.status(400).json({ error: errMessage });
    }
});

// Get customer by id
app.get("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const [cust, err] = await da.getCustomerById(id);
    if (cust) {
        res.json(cust);
    } else {
        res.status(404).json({ error: err });
    }
});

// Update customer
app.put('/customers/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (!updatedCustomer || Object.keys(updatedCustomer).length === 0) {
        return res.status(400).json({ error: "Missing request body" });
    }
    updatedCustomer.id = +id;
    delete updatedCustomer._id;
    const [message, errMessage] = await da.updateCustomer(updatedCustomer);
    if (message) {
        res.json({ message });
    } else {
        res.status(400).json({ error: errMessage });
    }
});

// Delete customer
app.delete("/customers/:id", async (req, res) => {
    const id = req.params.id;
    const [message, errMessage] = await da.deleteCustomerById(id);
    if (message) {
        res.json({ message });
    } else {
        res.status(404).json({ error: errMessage });
    }
});

// Start server after DB is ready
async function startServer() {
    try {
        await da.getCustomers(); // Ensures DB is ready
        app.listen(port, () => {
            console.log(`Server listening on port ${port}`);
        });
    } catch (err) {
        console.error("Failed to start server:", err);
        process.exit(1);
    }
}

startServer();

// Optional: Graceful shutdown
process.on('SIGINT', async () => {
    if (da.closeDb) await da.closeDb();
    process.exit(0);
});