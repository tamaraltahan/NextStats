const express = require('express')
const cors = require('cors')

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