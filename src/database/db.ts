import mongoose from "mongoose";

const MONGODB_URI = "mongodb://localhost:27017/my-database";

mongoose.connect(MONGODB_URI, {
  //   useNewUrlParser: true,
  //   useUnifiedTopology: true,
  //   useFindAndModify: false,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));

export default db;
