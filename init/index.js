const mongoose = require("mongoose");
const initData = require("./data.js"); //initData is an object
const Listing = require("../models/listing.js");

//connection setup
const MONGO_URL = "mongodb://127.0.0.1:27017/travelDB";

main()
    .then(()=>{
        console.log("connection successful");
    })
    .catch((err)=>{
        console.log(err);
    })

async function main(){
    await mongoose.connect(MONGO_URL);
}

//function to delete the previous random data and initialize new data into database
const initDB  = async () =>{
    await Listing.deleteMany({}); //delete the previous random data what we created for sample tes
    await Listing.insertMany(initData.data)  //initData is an object and data is key of our data.js //initData.data give us the array of data
    console.log("data was initialized");
};
initDB();