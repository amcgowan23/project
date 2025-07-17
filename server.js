// server.js file
const express = require('express');
const path = require('path');
const da = require("./data-access");
const app = express();
const port = process.env.PORT || 4000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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
app.post('/customers', async (req, res) => {
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
        // If using the improved data-access.js, dbStartup is called automatically and is safe to call again.
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