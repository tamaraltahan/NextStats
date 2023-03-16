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

let userID;
let playerData;

app.post('/setUserID/:userid', (req, res) => {
  userID = req.params.username;
  playerData = require(`./python/PlayerEntries/${userID}.json`);
  res.send(`User ID set as ${userID}`)
})


app.get('/players/:userid', (req, res) => {
  res.json(playerData.playerData)
});

app.get('/outlierWinsPositive/:userid', (req, res) => {
  res.json(playerData.outliers.outlierWinsPositive)
});

app.get('/outlierTotalsPositive/:userid', (req, res) => {
  res.json(playerData.outliers.outlierTotalsPositive)
});

app.get('/outliersWinsNegative/:userid', (req, res) => {
  res.json(playerData.outliers.outliersWinsNegative)
});

app.get('/outliersTotalNegative/:userid', (req, res) => {
  res.json(playerData.outliers.outliersTotalNegative)
});

app.get('/highWinLowGames/:userid', (req, res) => {
  res.json(playerData.outliers.outliersWinsNegative)
});

app.get('/lowWinLowGames/:userid', (req, res) => {
  res.json(playerData.outliers.outliersTotalNegative)
});

app.get('/winPercentThreshold/:userid', (req, res) => {
  res.json(playerData.outliers.winPercentThreshold)
});

app.get('/totalGamesThreshold/:userid', (req, res) => {
  res.json(playerData.outliers.totalGamesThreshold)
});

