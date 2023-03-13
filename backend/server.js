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
    res.send('Python Script completed')
  });
});

app.listen(port, () => {
  // console.log(`Example app listening on port ${port}`);
});
