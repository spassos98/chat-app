"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNumMessages = exports.getMessages = exports.insertMessage = exports.initDatabase = void 0;
const better_sqlite3_1 = __importDefault(require("better-sqlite3"));
let db = new better_sqlite3_1.default("foobar.db", { verbose: console.log });
function initDatabase(DB_FILE) {
    db = new better_sqlite3_1.default(DB_FILE, { verbose: console.log });
    db.pragma("journal_mode = WAL");
    createTables();
    return db;
}
exports.initDatabase = initDatabase;
function createTables() {
    const createMessagesTableSQL = "CREATE TABLE IF NOT EXISTS Messages('id' integer PRIMARY KEY, 'message' varchar, 'timestamp' varchar, 'user' varchar);";
    const createMessagesTable = db.prepare(createMessagesTableSQL);
    const createMessagesTableT = db.transaction(() => {
        createMessagesTable.run();
    });
    createMessagesTableT();
}
function insertMessage(message) {
    const insertMessageSQL = "INSERT INTO Messages (id, message, timestamp, user) VALUES (@id, @message, @timestamp, @user)";
    const insertMessageStmt = db.prepare(insertMessageSQL);
    const insertMessageT = db.transaction((message) => {
        insertMessageStmt.run(message);
    });
    insertMessageT(message);
}
exports.insertMessage = insertMessage;
function getMessages() {
    const getMessagesSQL = "SELECT user, message, timestamp from Messages";
    const rows = db
        .prepare(getMessagesSQL)
        .all()
        .map((row) => row);
    return rows;
}
exports.getMessages = getMessages;
function getNumMessages() {
    const getNumMessagesSQL = "SELECT count(*) as numMessages FROM Messages";
    const getNumMessagesStmt = db.prepare(getNumMessagesSQL);
    const response = getNumMessagesStmt.get();
    return response.numMessages;
}
exports.getNumMessages = getNumMessages;
