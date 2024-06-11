const express = require('express')
const logger = require('morgan')
const cors = require('cors')
const {WebSocketServer} = require('ws');
require('dotenv').config()

const currencyRouter = require('./routes/api/currency')

const app = express()

const server = require('http').createServer(app)

const wss = new WebSocketServer({server})

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
app.use(express.static("public"))

app.use('/api/currency', currencyRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  res.status(500).json({ message: err.message })
})

module.exports = app
