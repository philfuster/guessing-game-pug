const express = require('express');

const router = express.Router();

const debug = require('debug');

const log = debug('guess:routes');

const dateformat = require('dateformat');

const { ObjectID } = require('mongodb');

const url = require('url');

const { getDb } = require('../public/javascripts/db');

const appdata = require('../public/javascripts/app-data');

const { views, routes, title } = appdata;
/*
  === Function Defitions ===
*/
/**
 * Initialize Guessing Game.
 * @param {Request} req - Request object
 */
function init(req) {
  const secretNumber = Math.floor(Math.random() * 10 + 1);
  const now = dateformat();
  const id = ObjectID();
  //
  req.session.secretNumber = secretNumber;
  req.session.newGame = true;
  req.session.gameInProgress = true;
  req.session.timeStamp = now;
  req.session.id = id;
  log(`Number Generated: ${secretNumber}`);
}
/**
 * Handle Start GET Request
 *
 * @param {Request Object} req - Request Object
 * @param {Response Object} res - Response Object
 */
function handleStart(req, res) {
  log('Start being Handled...');
  init(req);
  res.render(views.start, { title });
}
/**
 * Handle Guess POST Request
 *
 * @param {Request} req - Request object
 * @param {Response} res - Response object
 */
async function handleGuess(req, res) {
  log('Guess being Handled...');
  const db = getDb();
  const gamesCol = db.collection('games');
  const { guess } = req.body;
  const { secretNumber, newGame, id, timeStamp } = req.session;
  let update;
  const success = parseInt(guess, 10) === secretNumber;
  const filter = { _id: id };
  const high = guess > secretNumber;
  const low = guess < secretNumber;
  const model = {};
  //
  log(`Guess submitted: ${guess}`);
  log(`${secretNumber} <> ${guess}`);
  model.title = title;
  //
  model.guess = guess;
  // New Game. Create DB record.
  if (newGame) {
    req.session.newGame = false;
    update = {
      $set: {
        _id: id,
        timeStamp,
        secretNumber,
        complete: false,
        guesses: [guess],
      },
    };
  } else {
    update = {
      $push: {
        guesses: guess,
      },
    };
  }
  if (success) {
    // Game no longer in progress
    req.session.gameInProgress = false;
    // update update to db
    if (newGame) {
      update.$set.complete = true;
    } else {
      update.$set = { complete: true };
    }
    model.result = 'success';
  } else if (high) {
    model.result = 'too high';
    model.class = 'highGuess';
  } else if (low) {
    model.result = 'too low';
    model.class = 'lowGuess';
  }
  // perform update
  try {
    await gamesCol.updateOne(filter, update, { upsert: true });
  } catch (err) {
    console.log(err.stack);
  }
  // When request is coming from start, redirect to success
  const urlParts = url.parse(req.headers.referer);
  const pathName = urlParts.pathname;
  const redirectPath = urlParts.href.replace('start', 'success');
  // POST from start requires either a redirect to sucess or rendering of guessForm
  if (pathName === '/start') {
    if (success) {
      res.redirect(302, redirectPath);
      res.end();
    } else {
      res.render(views.guessForm, model);
    }
  } else {
    res.end(JSON.stringify(model));
  }
}
/**
 * Handle Success
 */
function handleSuccess(req, res) {
  res.render(views.success, { title });
}
/**
 * Handle History
 */
async function handleHistory(req, res) {
  const db = getDb();
  const gamesCol = db.collection('games');
  const games = await gamesCol
    .find({
      complete: { $eq: true },
    })
    .toArray();
  res.render(views.history, { history: games, title });
}

/**
 * Handle detail
 */
async function handleDetail(req, res) {
  const db = getDb();
  const gamesCol = db.collection('games');
  //
  const uri = url.parse(req.url, true);
  const { gameid } = uri.query;
  try {
    const response = await gamesCol.findOne({
      _id: gameid,
    });
    const game = response;
    res.end(JSON.stringify(game));
  } catch (err) {
    console.log(err);
  }
}
/*
  === Routes ===
*/
/* GET index */
router.get('/', function (req, res) {
  log('Serving index');
  res.render(views.index, { title });
});

/* GET start */
router.get(routes.start, handleStart);

/* POST guess */
router.post(routes.guess, handleGuess);

/* GET history */
router.get(routes.history, handleHistory);

/* GET detail */
router.get(routes.detail, handleDetail);

/* GET success */
router.get(routes.success, handleSuccess);

module.exports = router;
