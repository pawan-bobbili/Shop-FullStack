const mongoose = require("mongoose");

const Product = require("../models/product.js");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  cart: {
    items: [
      {
        productId: {
          type: mongoose.Types.ObjectId,
          required: true,
          ref: "Product",
        },
        Quantity: { type: Number, required: true },
      },
    ], // use of ref ??... will be used while populating.
  },
  password: {
    type: String,
    required: true,
  },
  resetToken: String,
  resetTokenExpires: Date,
});

UserSchema.methods.addToCart = function (product) {
  const updatedCart = [...this.cart.items];
  const size = this.cart.items.length;
  var i = 0;
  while (i < size) {
    if (updatedCart[i].productId.toString() == product._id.toString()) {
      // Without .toString() , even the == operator also doesn't works.
      updatedCart[i].Quantity = updatedCart[i].Quantity + 1;
      break;
    }
    i++;
  }
  if (i == size) {
    updatedCart.push({
      productId: product._id,
      Quantity: 1,
    });
  }
  this.cart.items = updatedCart;
  return this.save();
};

UserSchema.methods.GetCart = function () {
  const user = this;
  // To understand Asynchronous nature
  return new Promise(function (resolve, reject) {
    const cartitems = [...user.cart.items];
    const CartProducts = [];
    const size = cartitems.length;
    var i = 0,
      count = 0;
    if (!size) {
      resolve([]);
    }
    while (i < size) {
      Product.findOne({
        _id: new mongoose.Types.ObjectId(cartitems[i].productId),
      })
        .then((product) => {
          CartProducts.push({
            title: product.title,
            _id: product._id,
            price: product.price,
            Quantity: cartitems[count].Quantity,
          });
          count++;
          if (count == size) {
            resolve(CartProducts);
          }
        })
        .catch((err) => {
          reject(err);
        });
      i++;
    }
  });
};

UserSchema.methods.DeleteFromCart = function (prodId) {
  const user = this;
  const cartitems = [...user.cart.items];
  const updatedCart = [];
  // Do not use map for filtering content like these... a null object will be placed there to get the same length of source
  for (let item of cartitems) {
    if (item.productId.toString() != prodId.toString()) {
      updatedCart.push(item);
    }
  }
  this.cart.items = updatedCart;
  return this.save();
};

module.exports = mongoose.model("User", UserSchema);
