const mongoose = require("mongoose");
const initData = require("./data.js"); //initData is an object
const Listing = require("../models/listing.js");


// Disable in production
if (process.env.NODE_ENV === "production") {
    console.log("Seed script blocked in production.");
    process.exit();
}

// connect to local mongodb
const MONGO_URL = "mongodb://127.0.0.1:27017/travelDB";

//connect to MongoDB
const main = async () => {
    try {
        await mongoose.connect(MONGO_URL);
        console.log("Connection successful");
    } catch (err) {
        console.error("Connection error:", err);
        process.exit(1);
    }
};

//function to delete the previous random data and initialize new data into database
const initDB  = async () =>{
    try {
        await Listing.deleteMany({}); //delete the previous random data what we created for sample test
        //initializing the owner property into the database
        //map add new property inside array of individual object 
        initData.data = initData.data.map((obj)=> ({...obj, owner: "6925161afd33c9e7a6921bab"}));
        await Listing.insertMany(initData.data)  //initData is an object and data is key of our data.js //initData.data give us the array of data
        console.log("data was initialized");
    } catch(err) {
        console.error("seeding error", err);
    } finally {
        process.exit();
    }
};

// Run the script
const run = async () => {
    await main();
    await initDB();
};

run();

