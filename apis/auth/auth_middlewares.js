const { UserModel } = require( "../../models" );
const bcrypt = require( 'bcryptjs' );
const JWToken = require( 'jsonwebtoken' );
const Crypto = require('crypto');
const { sendEMail } = require( "../../misc" );
exports.handleUserLogin = async ( req, res, next ) => {
    
    try {

        
        const { email, password } = req.body;

        /* Validate input  */
        if ( !email || !password ) {
            return res.status( 400 ).json( { message: 'email and password are required.' } );
        };

        /*  Find User  */

        let user = await UserModel.findOne( { email } );
        if ( !user ) {
            return res.status( 401 ).json( { message: 'Invalid login credentials.' } );
        };

        /*  Check if user is verified */

        if ( !user.isVerified ) {
            return res.status( 401 ).json( { message: 'Please verify your account.' } );
        }

        /* Match password */
        const isMatch = bcrypt.compareSync( password, user.password );

        if ( !isMatch ) {
            return res.status( 401 ).json( { message: 'Invalid login credentials.' } );
        };

        /* Generate token */
        const token = JWToken.sign( { _id: user._id }, `secret`, { expiresIn: 60 * 1000 * 60 * 48 } ) //Expires in 48hrs 2 days

        return res.status( 200 ).json( { message: token } );




    } catch ( error ) {
        console.log( error );
    };
};


exports.handleUserRegistration = async ( req, res, next ) => {
    
    try {

        const { email, password } = req.body;

        /* Validate input  */
        if ( !email || !password ) {
            return res.status( 400 ).json( { message: 'email and password are required.' } );
        };
        const checkEmail = email.match( /^[^\s@]+@[^\s@]+\.[^\s@]+$/ );

        if ( !checkEmail ) {
            return res.status(400).json({message:'Invalid email.'})
        }

        /*  Check if user exist */
        let user = await UserModel.findOne( { email } );
        if ( user ) {
            return res.status( 409 ).json( { message: 'User exist.' } );
        };


        /* Hash a password  */
        const salt = bcrypt.genSaltSync(10);
        const hash = bcrypt.hashSync( password, salt );

        


        /* Generate Verification token  */
        const verification_token = Crypto.randomBytes( 16 ).toString( 'hex' );


        /* New User */
        const newUser = new UserModel( {
            email,
            password:hash,
            verification_token,
            verification_token_expires: Date.now() + 60 * 60 * 1000 * 72 // 72 Hours 3days
        } );

        /*Save new User */
        await newUser.save();

        /* Return a success response */
         res.status( 201 ).json( { message: 'registration successful.' } );



        let EmailData = {
            to: email,
            link:`http://localhost:2000/api/auth/verifyemail/${verification_token}`,
            subject: 'Verify Your Email.',
            verification_token
        };

        /* Send verification token to user */
        return await sendEMail( EmailData );
        
    } catch ( error ) {
        console.log( error )
    };
    
};



exports.handleAccountVerification = async ( req, res, next ) => {
    try {

        /* Get verification token from request body*/
        const { token } = req.params;

        if ( !token ) {
            return res.status( 400 ).json( { messsage: 'Token is required.' } )
        };

        /* Find the user with this token which has not expired.  */
        let user = await UserModel.findOne( { verification_token: token, verification_token_expires: { $gt: Date.now() } } );

        if ( !user ) {
            return res.status( 498 ).json( { message: 'Invalid or expired token supplied.' } );
        };

        /* Verify user and null other values */
        user.isVerified = true;
        user.verification_token = null;
        user.verification_token_expires = null;

        await user.save();


        return res.status( 200 ).json( { message: 'Account verification successful.' } );

    } catch ( error ) {
        console.log( error )
    }
};