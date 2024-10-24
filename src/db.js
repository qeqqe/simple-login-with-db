const mongoose = require("mongoose");

const mongoURI = "mongodb://localhost:27017/full-lockin";

const connectToMongo = async () => {
  await mongoose.connect(mongoURI);
  console.log(`successfully connected to mongoDB`);
};

module.exports = connectToMongo;
