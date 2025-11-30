const db = require('./config/db');

const describeTables = async () => {
    try {
        const [users] = await db.execute('DESCRIBE users');
        console.log('Users Table:', users);

        const [bookings] = await db.execute('DESCRIBE bookings');
        console.log('Bookings Table:', bookings);

        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

describeTables();
