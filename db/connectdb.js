const mongoose = require('mongoose')
const { MongoClient, ServerApiVersion } = require('mongodb');
const res = require('express/lib/response');
require('dotenv/config');
const connect= async()=> {
    try {
        const con = await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true,serverApi: ServerApiVersion.v1 })
        console.log(con.connection.host)
    } catch (error) {
        console.log(error)
    }

}

connect()

module.exports