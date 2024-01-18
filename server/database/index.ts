import Database from "better-sqlite3";

export interface Message {
  id: number;
  message: string;
  timestamp: string;
  user: string;
  roomid: number;
}

export interface Room {
  id: number;
  name: string;
}

let db = new Database("foobar.db", { verbose: console.log });

export function initDatabase(DB_FILE: string) {
  db = new Database(DB_FILE, { verbose: console.log });
  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON")

  createTables();

  return db;
}

function createTables() {
  const createRoomTableSql = "CREATE TABLE IF NOT EXISTS Rooms('id' integer PRIMARY KEY, 'name' varchar);"
  const createMessagesTableSQL =
    "CREATE TABLE IF NOT EXISTS Messages('id' integer PRIMARY KEY, 'message' varchar, 'timestamp' varchar, 'user' varchar, 'roomid' integer, FOREIGN KEY(roomid) REFERENCES Rooms(id));";

  const createRoomTable = db.prepare(createRoomTableSql)
  const createRoomTableT = db.transaction(() => {
    createRoomTable.run();
  });
  createRoomTableT();

  const createMessagesTable = db.prepare(createMessagesTableSQL);
  const createMessagesTableT = db.transaction(() => {
    createMessagesTable.run();
  });
  createMessagesTableT();
}

export function insertMessage(message: Message) {
  const insertMessageSQL =
    "INSERT INTO Messages (id, message, timestamp, user, roomid) VALUES (@id, @message, @timestamp, @user, @roomid)";
  const insertMessageStmt = db.prepare(insertMessageSQL);

  const insertMessageT = db.transaction((message: Message) => {
    insertMessageStmt.run(message);
  });
  insertMessageT(message);
}

export function getMessages() {
  const getMessagesSQL = "SELECT user, message, timestamp, roomid from Messages";
  const rows: (Omit<Message, 'id'>)[] = db
    .prepare(getMessagesSQL)
    .all()
    .map((row: any) => row);
  return rows;
}

export function getMessagesForRoom(roomId: number) {
  const getMessagesSQL = `SELECT user, message, timestamp, roomid from Messages where roomid = ${roomId}`;
  const rows: (Omit<Message, 'id'>)[] = db
    .prepare(getMessagesSQL)
    .all()
    .map((row: any) => row);
  return rows;
}

export function getNumMessages() {
  const getNumMessagesSQL = "SELECT count(*) as numMessages FROM Messages";
  const getNumMessagesStmt = db.prepare(getNumMessagesSQL);

  const response = getNumMessagesStmt.get() as { numMessages: number };
  return response.numMessages;
}

export function getRooms() {
  const getMessagesSQL = "SELECT id, name from Rooms";
  const rows: Room[] = db
    .prepare(getMessagesSQL)
    .all()
    .map((row: any) => row);
  return rows;
}
