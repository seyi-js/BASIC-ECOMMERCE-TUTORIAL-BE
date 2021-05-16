const Axios = require( 'axios' );
const { UserModel, PaymentModel } = require( '../../models' );
const Crypto = require('crypto')
let FLUTTERWAVE_PUBLIC_KEY;
let FLUTTERWAVE_SECRET_KEY;

if (process.env.NODE_ENV !== 'production') {
    FLUTTERWAVE_PUBLIC_KEY= require('../../config/config').FLUTTERWAVE_PUBLIC_KEY
    FLUTTERWAVE_SECRET_KEY= require('../../config/config').FLUTTERWAVE_SECRET_KEY
} else {
    FLUTTERWAVE_PUBLIC_KEY = process.env.FLUTTERWAVE_PUBLIC_KEY;
    FLUTTERWAVE_SECRET_KEY = process.env.FLUTTERWAVE_SECRET_KEY;
}


exports.handleInitiatePayment = async ( req, res, next ) => {


    try {

        const { amount } = req.body;

        const amountAlpha = amount.match( /[a-zA-Z] /g );
        const amountSpace = amount.match( /\s/g );
        const amountDigit = amount.match( /\D/g );

        if ( !amount || amountAlpha || amountSpace || amountDigit ) {
            return res.status( 400 ).json( { message: 'bad request.' } );
        };

        /* Get user  */
        let user = await UserModel.findById( req.user._id );

        /* Flutterwave payload format */
        let data = {
            "tx_ref": Crypto.randomBytes( 10 ).toString( 'hex' ),
            "amount": amount,
            "currency": "NGN",
            "redirect_url": "https://webhook.site/9d0b00ba-9a69-44fa-a43d-a82c33c36fdc",
            "payment_options": "card",
            "meta": {
                "user_id": user._id
            },
            "customer": {
                "email": user.email,
            },
            "customizations": {
                "title": "Basic Ecommerce Payments",
                "description": "Middleout isn't free. Pay the price",
                "logo": "https://assets.piedpiper.com/logo.png"
            }
        };


        /* request config */
        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ FLUTTERWAVE_SECRET_KEY }`
            }
        };

        const body = JSON.stringify( data );


        let response = await Axios.post( 'https://api.flutterwave.com/v3/payments', body, config );

        response = response.data;

        // console.log(response)

        res.status( 200 ).json( { message: response.data.link } )
        
    } catch ( error ) {
        console.log( error )
        res.json( error )
    }
};



exports.handlePaymentNotification = async ( req, res, next ) => {
    
    try {
        //https://developer.flutterwave.com/docs/events

        /*return a 200 status code to FLW  */
        res.status( 200 );

        const mySecretHash = '123456780nxnnnnxxx'//It must be thesame with the hash on your dashbord.

        /* Get hash from the req headers */
        const hash = req.headers[ 'verif-hash' ];

        if ( !hash ) {
            console.log( 'No hash.' );
            return
        };

        if ( hash !== mySecretHash ) {
            console.log( 'Unverified transaction noticed.' );
            return
        };

        /* retrieve request body/payment information */
        const requestBody = req.body;

        /* You might want to re-verify if the transaction is indeed legit  */

        const config = {
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${ FLUTTERWAVE_SECRET_KEY }`
            }
        };

        //https://developer.flutterwave.com/docs/transaction-verification

        const verification = await Axios.get( `https://api.flutterwave.com/v3/transactions/${ requestBody.data.id }/verify`, config );
        verification = verification.data;


        if ( verification.status !== 'success' ) {
            /* Not a valid transaction */
            console.log( 'Not a legit transaction.' );

            return
        };



            
        /* Verify certain parameters  */
        if ( requestBody.tx_ref !== verification.data.tx_ref
            || verification.data.currency !== 'NGN') {
            console.log( 'Not a legit transaction.' );

            return
        };
        //1453a1bdd74c0a2a046a

        /*  proceed with giving value for transaction */
        /*              Find the user                */
        
        const user = await UserModel.findById( verification.data.meta.user_id );
        if ( !user ) {
            console.log( 'User not found.' );
            return
        };


        const newPayment = new PaymentModel( {
            user_id: user._id,
            status: verification.data.status,
            reference: verification.data.tx_ref,
            payment_info: verification.data
        } );


        let payment = await newPayment.save();

        user.payments.push( payment._id );

        await user.save();

        console.log('Transaction done.')




        
    } catch ( error ) {
        console.log(error)
        res.json(error)
    }
}