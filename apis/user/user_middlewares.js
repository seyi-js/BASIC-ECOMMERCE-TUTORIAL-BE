const {UserModel} = require('../../models/')

exports.handleGetUserDetails = async ( req, res, next ) => {
    try {
        let user = await UserModel.findById( req.user._id )
            .populate( 'payments' )

        let apiResponse = {
            email: user.email,
            isVerified: user.isVerified,
            payments:user.payments
        };

        return res.status( 200 ).json( { message: apiResponse } );
    } catch ( error ) {
        console.log( error );
    }
};