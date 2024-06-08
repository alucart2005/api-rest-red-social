const mongoose = require("mongoose");

const connection = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/mi_redsocial");
    console.log("Connection to mi_redsocial established");
  } catch (error) {
    console.log(error);
    throw new Error("Database connection failed!");
  }
};

module.exports = connection;
