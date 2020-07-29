const mongodb = require('mongodb');

const MongoClient = mongodb.MongoClient;

let _db;

const MongoConnect = callback => {
    MongoClient.connect('mongodb+srv://node-user:Karnal18@cluster0-sgm7m.mongodb.net/test?retryWrites=true&w=majority').then(client => {
        _db = client.db('shop');
        console.log("Connected");
        callback();
    }).catch(err => console.log(err));
}

const getDb = () => {
    return _db;
}

exports.MongoConnect = MongoConnect;
exports.getDb = getDb;