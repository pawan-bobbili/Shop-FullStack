const fs = require('fs')
const path = require('path');

const Order = require('../models/orders.js');
const Product = require('../models/product.js');
const User = require('../models/user.js');

exports.getProducts = (req,res,next) => {
    Product.find().then(products => {
        res.render('shop/product_list.ejs',{
           pagetitle: 'Welcome To shop!',
           products: products,
        });
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
};

exports.productdetailsfromid = (req,res,next) => {
    Product.findById(req.params.productid).then(product => {
        res.render('shop/product_details.ejs',{
           pagetitle:'Description for ' + product.title.toString(),
           product: product,
        })
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
};

exports.displayCart = (req,res,next) => {
    User.findById(req.session.userId).then(user => {
        currentuser = user;
        return user.GetCart();
    }).then(products => {
        res.render('shop/cart.ejs',{
            pagetitle: currentuser.name + ' Cart',
            products: products,
        });
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
}

exports.addtocart = (req,res,next) => {
    const prodID = req.body.id;
    let product;
    Product.findById(prodID).then(prod => {
        product = prod;
        return User.findById(req.session.userId);
    }).then(user => {
        return user.addToCart(product);
    }).then(() => {
        res.redirect('/');
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
}

exports.deletecart = (req,res,next) => {
    User.findById(req.session.userId).then(user => {
        return user.DeleteFromCart(req.body.productid);
    }).then(() => {
        res.redirect('/cart');
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
}

exports.addorders = (req, res, next) => {
    let currentuser;
    User.findById(req.session.userId).then(user => {
        currentuser = user;
        return user.GetCart();
    }).then(products => {
        const order = new Order({
            userId: req.session.userId,
            products: products
        });
        return order.save();
    }).then(() => {
        currentuser.cart.items = [];
        return currentuser.save();
    }).then(() => {
        res.redirect('/cart');
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
}

exports.displayOrders = (req, res, next) => {
    Order.find({userId : req.session.userId}).then(orders => {
        res.render('shop/orders.ejs',{
           pagetitle: req.session.name + ' Orders',
           orders: orders,
           //csrfToken: req.csrfToken()
        });
    }).catch(err => {
        if(err){
            console.log(err);
            res.redirect('/500');
        }
    });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    const Invoicepath = path.join(__dirname,'..','..','11812061.docx');
    res.setHeader('Content-Type','application/docx')
    fs.readFile(Invoicepath,(err, data) => {
        if(err){
            next(err);
        }
        res.send(data);
    })
}