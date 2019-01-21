import mongoose from 'mongoose'
import config from './config.json';

const mongodbURL = process.env.MONGODB_URL || config.mongodbURL;

export default callback => {
	
	mongoose.connect(mongodbURL);

	const db = mongoose.connection;

	db.on('error', console.error.bind(console, 'connection error:'));
	db.once('open', function() {
		console.log(`Successfully logged to ${mongodbURL}`);
	});

	callback(db);
}
