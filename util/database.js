const mongodb = require("mongodb");

const MongoClient = mongodb.MongoClient;
const keys = require("../apikeys");

let _db;

const MongoConnect = (callback) => {
  MongoClient.connect(keys.mongoURI)
    .then((client) => {
      _db = client.db("shop");
      console.log("Connected");
      callback();
    })
    .catch((err) => console.log(err));
};

const getDb = () => {
  return _db;
};

exports.MongoConnect = MongoConnect;
exports.getDb = getDb;
