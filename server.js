// server.js file
const express = require('express');
const path = require('path');  // for handling file paths
const bodyParser = require('body-parser'); // for parsing request bodies

const app = express();
const port = process.env.PORT || 4000;  // use env var or default to 4000

app.use(bodyParser.json());
// Set the static directory to serve files from
app.use(express.static(path.join(__dirname, 'public')));

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

"scripts"; {
"test"; "echo \"Error: no test specified\" && exit 1",
"start"; "node server.js"
};

const da = require("./data-access");
//add statement that imports data-access.js
app.get("/customers", async (req, res) => {
     const [cust, err] = await da.getCustomers();
     if(cust){
         res.send(cust);
     }else{
         res.status(500);
         res.send(err);
     }   
});
app.get("/reset", async (req, res) => {
    const [result, err] = await da.resetCustomers();
    if(result){
        res.send(result);
    }else{
        res.status(500);
        res.send(err);
    }   
});
app.post('/customers', async (req, res) => {
    const newCustomer = req.body;
    if (newCustomer === null || req.body != {}) {
        res.status(400);
        res.send("missing request body");
    } else {
        // return array format [status, id, errMessage]
        const [status, id, errMessage] = await da.addCustomer(newCustomer);
        if (status === "success") {
            res.status(201);
            let response = { ...newCustomer };
            response["_id"] = id;
            res.send(response);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});
app.get("/customers/:id", async (req, res) => {
     const id = req.params.id;
     // return array [customer, errMessage]
     const [cust, err] = await da.getCustomerById(id);
     if(cust){
         res.send(cust);
     }else{
         res.status(404);
         res.send(err);
     }   
}); 
// Add GET by ID Handler
app.put('/customers/:id', async (req, res) => {
    const id = req.params.id;
    const updatedCustomer = req.body;
    if (updatedCustomer === null || req.body != {}) {
        res.status(400);
        res.send("missing request body");
    } else {
        delete updatedCustomer._id;
        // return array format [message, errMessage]
        const [message, errMessage] = await da.updateCustomer(updatedCustomer);
        if (message) {
            res.send(message);
        } else {
            res.status(400);
            res.send(errMessage);
        }
    }
});
