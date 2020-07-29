const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true
    },
    products:[ {
        title:{type: String, required: true},
        _id:{type:mongoose.Types.ObjectId, ref:'Product',required:true},
        price:{type:Number,required:true},
        Quantity:{type:Number}
    }]
});

module.exports = mongoose.model('Order',OrderSchema);