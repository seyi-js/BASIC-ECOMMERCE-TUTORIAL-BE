const express = require( 'express' );
const { verifyToken } = require( '../../helper/middlewares' );
const { handleGetUserDetails } = require( './user_middlewares' );
const router = express.Router();




//GET user details

router.get( '/',verifyToken,handleGetUserDetails );


module.exports = router;