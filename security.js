var crypto = require('crypto');

let apiKey = null;
let apiKeys = new Map();

function getNewApiKey(email){
  let newApiKey = crypto.randomBytes(6).toString('hex');
  apiKeys.set(email, newApiKey);
  displayApiKeys();
  return newApiKey;
}

function displayApiKeys(){
  console.log("apiKeys:");
  for(let entry of apiKeys.entries()){
    console.log(entry)
  }
}

function setApiKey(){
  apiKey = process.env.API_KEY;
  if(process.argv[2] != null){
      if(process.argv[2].indexOf('=') >= 0){
          apiKey = process.argv[2].substring(process.argv[2].indexOf('=')+1,process.argv[2].length );
      }
  }
  if(apiKey && apiKey.length >0){
      apiKeys.set("default", apiKey );
      displayApiKeys();
  }else{
      console.log("apiKey has no value. Please provide a value through the API_KEY env var or --api-key cmd line parameter.");
      process.exit(0);
  }  
}

function checkApiKey(req, res, next) {
    const apiKeyHeader = req.headers['x-api-key']; // Assuming the API key is sent in the header named 'x-api-key'
  
    // Check if API key is present
    if (!apiKeyHeader) {
      return res.status(401).json({ message: 'Unauthorized: Missing API key' });
    }
  
    // Compare the received key with the stored key (from environment variable or configuration file)
    let keyValid = false;    
    for( let value of apiKeys.values()){
      if (apiKeyHeader === value){
        keyValid = true;
      }
    }
    if (!keyValid ) {
      return res.status(403).json({ message: 'Forbidden: Invalid API key' });
    }
  
    // If valid key, continue processing the request
    next();
  }
  
  setApiKey();
  
  module.exports = {setApiKey, checkApiKey, getNewApiKey};