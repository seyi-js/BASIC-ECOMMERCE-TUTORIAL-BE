const Axios = require( 'axios' );
const { UserModel } = require( '../../models' );
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


exports.handleInitiatePayment = async (req,res,next) => {


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
                "user_id":user._id
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

        res.status(200).json({message:response.data.link})
        
    } catch (error) {
        console.log(error)
        res.json(error)
    }
}