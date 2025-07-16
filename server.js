// server.js file
const express = require('express');
const path = require('path');  // for handling file paths

const app = express();
const port = process.env.PORT || 4000;  // use env var or default to 4000

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
