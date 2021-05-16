const Mailer = require( 'nodemailer' );
let APP_NAME;
let email_server;
let email_address;
let email_password;
const { VerifyEmailTemplate } = require( './emailTemp' );


if ( process.env.NODE_ENV === 'production' ) {
    APP_NAME = process.env.APP_NAME;
    email_address = process.env.email_address;
    email_server = process.env.email_server;
    email_password = process.env.email_password;
} else {
    APP_NAME = require( '../config/config' ).APP_NAME;
    email_address=require( '../config/config' ).email_address
    email_password=require( '../config/config' ).email_password
    email_server=require( '../config/config' ).email_server
}

exports.sendEMail = async (EmailData ) => {

    EmailData.input = VerifyEmailTemplate( EmailData );

    try {
        const Transporter = Mailer.createTransport( {
            service: email_server ,
            host: email_server ,
            port:587,
            secure: false,
            auth: {
                user: email_address,
                pass: email_password
            },
            tls: {
                rejectUnauthorized: false
            }
            
        } );
    
        var mailOptions = {
            from: `"${APP_NAME }" <${email_address }>`,
            to: EmailData.to,
            subject: EmailData.subject,
            html: EmailData.input,
            
        };
    
        const mail = await Transporter.sendMail( mailOptions );
    
        return mail;
    } catch (error) {
        throw err;
    }
};