const mongoose = require("mongoose");
const dns = require("dns");

dns.setServers([
  "1.1.1.1",
  "8.8.8.8"
]);

const connectDB = async () => {
  try {
    mongoose.connection.on("connected", () => {
      console.log("Database connected");
    });

    await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.log(error);
  }
};

module.exports = connectDB;