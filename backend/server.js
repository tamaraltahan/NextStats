const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");


const app = express();
const port = 3001;

app.use(cors());
app.use(express.json())

app.get("/", (req, res) => {
  res.send("Waheblay");
});

app.post("/verified", (req, res) => {
  console.log('script is now running')
  const id = req.body.id
  exec(`python ./gamestats/backend/python/job.py ${id}`, (error, stdout, stderr) => {
    if (error) {
     // console.log(`error: ${error.message}`);
      res.status(500).send(`Error running Python script: ${error.message}`);
      return;
    }
    if (stderr) {
      // console.log(`stderr: ${stderr}`);
      res.status(500).send(`Error running Python script: ${stderr}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    res.json(
      {
        "Completed": true
      }
    )
  });
});

app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});


app.get('/players/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.playerData)
});

app.get('/outlierWinsPositive/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outlierWinsPositive)
});

app.get('/outlierTotalsPositive/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outlierTotalsPositive)
});

app.get('/outliersWinsNegative/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outliersWinsNegative)
});

app.get('/outliersTotalNegative/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outliersTotalNegative)
});

app.get('/highWinLowGames/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outliersWinsNegative)
});

app.get('/lowWinLowGames/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.outliersTotalNegative)
});

app.get('/winPercentThreshold/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.winPercentThreshold)
});

app.get('/totalGamesThreshold/:userid', (req, res) => {
  const username = req.params.username;
  const playerData = require(`./python/PlayerEntries/${username}.json`);
  res.json(playerData.outliers.totalGamesThreshold)
});


// or I could do it as one giant block. I don't know what's a better sln here.

/*

app.get('/outliers/:userId/:subsection', (req, res) => {

  let data = 

  const userId = req.params.userId;
  const subsection = req.params.subsection

  const userOutlierWinsPositive = data.outliers.outlierWinsPositive[userId];
  const userOutlierTotalsPositive = data.outliers.outlierTotalsPositive[userId];
  const outliersWinsNegative = data.outliers.outliersWinsNegative[userId];
  const outliersTotalNegative = data.outliers.outlierTotalsPositive[userId];
  const highWinLowGames = data.outliers.highWinLowGames[userId];
  const lowWinLowGames = data.outliers.lowWinLowGames[userId];
  const winPercentThreshold = data.outliers.winPercentThreshold[userId];
  const totalGamesThreshold = data.outliers.totalGamesThreshold[userId];

  let userSubsection;
  if (subsection === 'outlierWinsPositive') {
    userSubsection = data.outliers.outlierWinsPositive[userId];
  } else if (subsection === 'outlierTotalsPositive') {
    userSubsection = data.outliers.outlierTotalsPositive[userId];
  } else {
    res.status(400).send('Invalid subsection');
    return;
  }

  if (!userSubsection) {
    res.status(404).send('User not found');
    return;
  }


  res.send(userData);
});
*/

