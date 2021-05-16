const express = require( 'express' );
const { verifyToken } = require( '../../helper/middlewares' );
const { handleInitiatePayment, handlePaymentNotification } = require( './payment_middlewares' );
const router = express.Router();






//POST initiate payment api/payment/initiate

router.post( '/initiate', verifyToken,handleInitiatePayment );





//POST initiate payment api/payment/notification

router.post( '/notification',handlePaymentNotification );




module.exports = router