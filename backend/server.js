const express = require('express');
const cors = require('cors');
const { exec } = require('child_process');

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Waheblay');
});

app.post('/verified', (req, res) => {
  // console.log('script is now running')
  const id = req.body.id;
  exec(`python ./backend/python/job.py ${id}`, (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      res.status(500).send(`Error running Python script: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      res.status(500).send(`Error running Python script: ${stderr}`);
      return;
    }
    // console.log(`stdout: ${stdout}`);
    res.json({
      Completed: true,
    });
  });
});

// app.post("/verified", (req, res) => {
//   res.json(
//     {
//     "response": true
//     }
//   )
// });

app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});

app.get(`/playerData`, (req, res) => {
  const pid = req.query.id;
  const jsonData = require(`./python/PlayerEntries/${pid}`);

  // Initialize the total and winPercent arrays
  const totalArray = [];
  const winPercentArray = [];

  // Loop through each player in the playerData object and push the 'total' and 'winPercent' values to the corresponding arrays
  Object.keys(jsonData.playerData).forEach(playerId => {
    const player = jsonData.playerData[playerId];
    totalArray.push(player.total);
    winPercentArray.push(player.winPercent);
  });

  // Add the total and winPercent arrays to the jsonData object
  jsonData.totals = totalArray;
  jsonData.winPercents = winPercentArray;

  res.json(jsonData);
});
