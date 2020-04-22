const assert = require('assert');

const { MongoClient } = require('mongodb');

const debug = require('debug');

const log = debug('guess:dbConnection');

// Connection URL
const dbUrl =
  'mongodb+srv://paf:test@guessinggame-2plqp.mongodb.net/test?retryWrites=true&w=majority';
// Database name
const dbName = 'GuessingGame';

const client = new MongoClient(dbUrl, { useUnifiedTopology: true });

let db;

async function initDb() {
  if (db) {
    log('Trying to init DB again!');
  }
  try {
    await client.connect();
    log('Connected to MongoDB Atlas correctly');
    db = client.db(dbName);
    log(`DB initialized - connected to: ${dbUrl.split('@')[1]} `);
  } catch (err) {
    log(`${err.stack}`);
  }
}

function getDb() {
  assert.ok(db, 'Db has not been initialized. Please call initDb() first.');
  return db;
}

module.exports = {
  getDb,
  initDb,
};
