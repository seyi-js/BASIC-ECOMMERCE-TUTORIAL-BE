const express = require( 'express' );
const app = express();
const PORT = process.env.PORT || 2000;
const helmet = require( 'helmet' );
const cors = require( 'cors' );
const { connectToDatabase } = require( './config/DBconfig' );



app.use( cors() );
app.use( helmet() );
app.use( express.json() );
connectToDatabase();

const auth = require('./apis/auth')
const user = require('./apis/user')
const payment = require('./apis/payment')

/*routes */
app.use( '/api/auth', auth );
app.use( '/api/user', user );
app.use( '/api/payment', payment );






app.listen(PORT, () => console.log(`Server running on port ${PORT} 🔥`));