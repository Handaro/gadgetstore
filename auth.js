// [SECTION] Dependenies and Modules
// use the "require" directive to load jsonwebtoken module/package that will send information between our application in a secure manner.
const jwt = require("jsonwebtoken");
// allow access to the environment variables inside .env file
require('dotenv').config();

// [Section] JSON Web Tokens
/*
- JSON Web Token or JWT is a way of securely passing information from the server to the client or to other parts of a server
- Information is kept secure through the use of the secret code
- Only the system that knows the secret code that can decode the encrypted information
- Imagine JWT as a gift wrapping service that secures the gift with a lock
- Only the person who knows the secret code can open the lock
- And if the wrapper has been tampered with, JWT also recognizes this and disregards the gift
- This ensures that the data is secure from the sender to the receiver
*/

// Token creation
/*
	Analogy: Pack the gift and provide a lock with the secret code as the key
*/
module.exports.createAccessToken = (user) => {

	// the data received from the user will be saved in the "data" variable
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: user.isAdmin
	};

	// generate a JSON web token using the sing() method
	// the sign() method has 3 arguments, the first argument contains the payload which is the information that we will send between our applications, the second arguments is the secret key that is defined by the developer, the third argument are optional additions in your jwt
	return jwt.sign(data, process.env.JWT_SECRET_KEY, {});
}

// Token Verification and Decryption
/*
	- Analogy: Receive the gift and open the lock to verify if the the sender is legitimate and the gift was not tampered with
	
	- Verify will be used as a middleware in ExpressJS. Functions added as argument in an expressJS route are considered as middleware and is able to receive the request and response objects as well as the next() function. Middlewares will be further elaborated on later sessions.
*/
// "req" parameter will be the request object
// "res" parameter will be the response object
// "next" parameter will be responsible for continuing the function
module.exports.verify = (req, res, next) => {

	// display the content of the request body authorization
	console.log(req.headers.authorization);

	// store the content of the req.headers.authorization in the "token" variable
	let token = req.headers.authorization;

	// if the data type of the token variable is equal to undefined
	if(typeof token === 'undefined') {

		return res.status(400).send({ auth: "Failed. No Token" });

	// if there is a token stored in the token variable
	} else {

		console.log(token);
		// reassign the sliced token in the 'token' variable 
		token = token.slice(7, token.length);
		console.log(token);

		// verify() mthod will decrypt the token using the secret key and return the decrypted token information in the decodedToken variable
		// the function given is different from the previous functions used, the first parameter will store the error
		jwt.verify(token, process.env.JWT_SECRET_KEY, function(err, decodedToken) {

			// if there was an error encountered
			if(err) {

				return res.status(403).send({
					auth: "Failed",
					message: err.message
				})

			// if it as verified successfully
			} else {

				console.log("result from verify method:");
				console.log(decodedToken);

				// the information stored in the decodedToken will be reassigned to the req.user
				/*
					req.user = {
						id: '66fc91d4395a256400bf6f3a',
						email: 'hillaryalmonte@mail.com',
						isAdmin: false,
						iat: 1727849065
					}
				*/
				req.user = decodedToken;

				// next() is an expressJS function which will allow us to move to he next function
				next();
			}

		})
	}
}

module.exports.verifyAdmin = (req, res, next) => {

	// if the isAdmin property of the req.user is equal to true
	if(req.user.isAdmin) {

		// move to the next middleware using the next() method
		next();

	// if the isAdmin property of the req.user is equal to false
	} else {

		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden"
		})
	}
}

// this function can be invoked to receive the error and process as a response
module.exports.errorHandler = (err, req, res, next) => {

	// display the error in the terminal/console
	console.error(err);

	const statusCode = err.status || 500;

	// if the err object contains a message property, we will store the message in the errorMessage variable
	// if there is no message property in the err object, it will store 'Internal Server Error' in the errorMessage variable
	const errorMessage = err.message || 'Internal Server Error';

	// res.json() is similar to res.send() but it is specific to sending a JSON response
	// this will contain the standardized error response
	res.status(statusCode).json({
		error: {
			message: errorMessage,
			// the errorCode can contain either status code OR 'SERVER ERROR'
			errorCode: err.code || 'SERVER ERROR',
			details: err.details || null 
		}
	})
}

module.exports.isLoggedIn = (req, res, next) => {
	if(req.user) {
		next();
	} else {
		res.sendStatus(401);
	}
}