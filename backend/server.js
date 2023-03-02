const express = require('express')
const cors = require('cors')
const spawn = require('child_process').spawn

const app = express()
const port = 3001

app.use(cors())

app.get('/', (req, res) => {
  res.send('Waheblay')
})


app.post('/verified', (req,res) => {
  res.send("Poggers")
})


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})


const ls = spawn('python', [''])