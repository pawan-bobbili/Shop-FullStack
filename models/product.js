const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    dsc:{
        type:String,
        required:true
    },
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User' 
    },
    imgUrl: {
        type:String,
        required:true
    }
})

module.exports = mongoose.model('Product',ProductSchema);