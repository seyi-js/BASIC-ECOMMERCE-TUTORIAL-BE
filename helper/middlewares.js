const jwt = require('jsonwebtoken')
//@desc Verify Json Web Tokens

exports.verifyToken =  ( req, res, next ) => {

    const token = req.header( 'X-AUTH-TOKEN' );
  
        if ( !token ) {
        
            return res.status(401).json({message:'No token, authorization denied', code:401}  )
        } else {
            if ( token ) {
                try {
                    const decoded = jwt.verify( token, 'secret'  );
                    req.user = decoded;
                    // decoded;
                    // console.log( decoded )
                    next();
                } catch ( e ) {
                  
                    console.log(e)
                    return res.status(498).json( { message: 'Invalid Token', code: 498 } );
    
                    
                };
            };
        };
};