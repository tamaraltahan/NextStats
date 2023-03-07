const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");

const app = express();
const port = 3001;

app.use(cors());

app.get("/", (req, res) => {
  res.send("Waheblay");
});

app.post("/verified", (req, res) => {
  console.log('script is now running')
  exec("python ../src/python/job.py", (error, stdout, stderr) => {
    if (error) {
      console.log(`error: ${error.message}`);
      return;
    }
    if (stderr) {
      console.log(`stderr: ${stderr}`);
      return;
    }
    console.log(`stdout: ${stdout}`);
  });
  res.send('Python Script completed')
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
