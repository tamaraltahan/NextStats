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
  const pid = req.query.id
  const jsonData = require(`./python/PlayerEntries/${pid}`)
  res.json(jsonData)
})


