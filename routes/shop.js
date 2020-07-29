const express = require('express');

const Shopcontroller = require('../controllers/shop.js');
const isAuth = require('../middlware/isauth.js');

const router = express.Router();

router.get('/', Shopcontroller.getProducts); //get is used instead of use. when used "use" only pattern maching will happen i.e any url with '/' starting will be considered. for get , whole string should match

router.get('/cart', isAuth, Shopcontroller.displayCart);

router.get('/products',Shopcontroller.getProducts);

router.get('/orders', isAuth, Shopcontroller.displayOrders);

router.post('/addtocart', isAuth, Shopcontroller.addtocart);

router.post('/details/:productid', Shopcontroller.productdetailsfromid);

router.post('/cart/delete', isAuth, Shopcontroller.deletecart);

router.post('/add-orders', isAuth, Shopcontroller.addorders);

router.get('/orders/:orderId',isAuth,Shopcontroller.getInvoice);

module.exports = router;