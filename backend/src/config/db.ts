import mongoose from 'mongoose'
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

dotenv.config();

// 数据库连接函数
const connectDB = async () => {
    try {
        const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/myblog';
        const conn = await mongoose.connect(mongoUri);

        console.log(`MongoDB 连接成功: ${conn.connection.host}`);
    } catch (error) {
        console.error(`MongoDB 连接失败`);
        process.exit(1);
    }
};

const adapter = new PrismaMariaDb({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DB || "myblog",
    connectionLimit: 10,
    allowPublicKeyRetrieval: true
});

const prisma = new PrismaClient({ adapter });

export { connectDB, prisma };
