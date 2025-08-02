const { QuickDB } = require('quick.db');
const path = require('path');

const db = new QuickDB({ filePath: path.join(__dirname, '../data/database.sqlite') });

module.exports = db;