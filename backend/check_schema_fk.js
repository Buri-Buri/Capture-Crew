const db = require('./config/db');

const checkSchema = async () => {
    try {
        const [users] = await db.execute('SHOW CREATE TABLE users');
        console.log('Users Table:', users[0]['Create Table']);

        const [bookings] = await db.execute('SHOW CREATE TABLE bookings');
        console.log('Bookings Table:', bookings[0]['Create Table']);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkSchema();
