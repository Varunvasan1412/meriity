import fs from 'node:fs/promises';
import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const { database, ...conn } = env.db;
const db = await mysql.createConnection({ ...conn, multipleStatements: true });
await db.query(`CREATE DATABASE IF NOT EXISTS \`${database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
await db.query(`USE \`${database}\``);
await db.query(await fs.readFile(new URL('./schema.sql', import.meta.url), 'utf8'));
await db.end();
console.log(`Migrated database "${database}"`);
