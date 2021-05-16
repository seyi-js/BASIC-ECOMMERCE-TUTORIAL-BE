const express = require( 'express' );
const { verifyToken } = require( '../../helper/middlewares' );
const { handleInitiatePayment } = require( './payment_middlewares' );
const router = express.Router();






//POST initiate payment api/payment/initiate

router.post( '/initiate', verifyToken,handleInitiatePayment );





//POST initiate payment api/payment/notification

router.post( '/notification' );




module.exports = router