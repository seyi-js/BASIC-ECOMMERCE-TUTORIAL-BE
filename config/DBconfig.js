const mongoose = require( 'mongoose' );
mongoose.set( 'useCreateIndex', true );



let db;

//Switch DB in production
( process.env.NODE_ENV !== 'production' ) ? db = 'mongodb://localhost:27017/basicecommerce' : db = process.env.DB;


//Connect to database

exports.connectToDatabase = async () => {
    try {
        await mongoose.connect( db, {
            useUnifiedTopology: true, useNewUrlParser: true
        } );
            
        console.log( 'Connected to Basic Ecommerce Database' );
    } catch ( error ) {
        console.log( error )
    }
};




