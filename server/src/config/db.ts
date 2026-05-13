import mysql from 'mysql2/promise';

const config = {
    host : process.env.DB_HOST || 'localhost',
    user : process.env.DB_USER || 'root',
    database : process.env.DB_NAME || '',
    password : process.env.DB_PASSWORD || '' 
}

export async function getConn() : Promise<mysql.Connection>{
    return await mysql.createConnection(config);
}