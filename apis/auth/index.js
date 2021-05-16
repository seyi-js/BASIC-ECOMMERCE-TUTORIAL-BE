

const express = require( 'express' );
const Router = express.Router();
const { handleUserLogin, handleUserRegistration, handleAccountVerification } = require( "./auth_middlewares" );





//POST /api/auth/login
Router.post( '/login',handleUserLogin);



//POST /api/auth/register
Router.post( '/register',handleUserRegistration);


//POST /api/auth/verifyemail/:token
Router.post( '/verifyemail/:token',handleAccountVerification);













module.exports = Router;