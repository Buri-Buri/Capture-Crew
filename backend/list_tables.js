const db = require('./config/db');

const listTables = async () => {
    try {
        const [rows] = await db.execute('SHOW TABLES');
        console.log('Tables:', rows);
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

listTables();
