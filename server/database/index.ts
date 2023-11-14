import Database from "better-sqlite3";

export interface Message {
  id: number;
  message: string;
  timestamp: string;
}

let db = new Database("foobar.db", { verbose: console.log });

export function initDatabase(DB_FILE: string) {
  db = new Database(DB_FILE, { verbose: console.log });
  db.pragma("journal_mode = WAL");

  createTables();

  return db;
}

function createTables() {
  const createMessagesTableSQL =
    "CREATE TABLE IF NOT EXISTS Messages('id' integer PRIMARY KEY, 'message' varchar, 'timestamp' varchar);";

  const createMessagesTable = db.prepare(createMessagesTableSQL);

  const createMessagesTableT = db.transaction(() => {
    createMessagesTable.run();
  });

  createMessagesTableT();
}

export function insertMessage(message: Message) {
  const insertMessageSQL =
    "INSERT INTO Messages (id, message, timestamp) VALUES (@id, @message, @timestamp)";
  const insertMessageStmt = db.prepare(insertMessageSQL);

  const insertMessageT = db.transaction((message: Message) => {
    insertMessageStmt.run(message);
  });
  insertMessageT(message);
}

export function getMessages() {
  const getMessagesSQL = "SELECT message from Messages";
  const messages = db
    .prepare(getMessagesSQL)
    .all()
    .map((row: any) => row.message);
  return messages;
}

export function getNumMessages() {
  const getNumMessagesSQL = "SELECT count(*) as numMessages FROM Messages";
  const getNumMessagesStmt = db.prepare(getNumMessagesSQL);

  const response = getNumMessagesStmt.get() as { numMessages: number };
  return response.numMessages;
}
