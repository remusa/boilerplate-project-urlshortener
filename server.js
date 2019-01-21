'use strict'

const express = require('express')
// const mongo = require('mongodb')
// const mongoose = require('mongoose')
const knex = require('knex')

const cors = require('cors')
const bodyParser = require('body-parser')

const app = express()

// Basic Configuration
const PORT = process.env.PORT || 3000

/** this project needs a db !! **/
// mongoose.connect(process.env.MONGOLAB_URI);

// Using Postgres
const db = knex({
    client: 'pg',
    connection: {
        connectionString: process.env.DATABASE_URL,
        ssl: true,
    }
})

app.use(cors())

/** this project needs to parse POST bodies **/
// you should mount the body-parser here
app.use(bodyParser())

app.use('/public', express.static(process.cwd() + '/public'))

app.get('/', (req, res) => {
    res.sendFile(process.cwd() + '/views/index.html')
})

// your first API endpoint...
app.get('/api/hello', (req, res) => {
    res.json({ greeting: 'hello API' })
})

app.post('/api/shorturl/new', (req, res) => {
    const body = req.body
    console.log(body)

    const originalURL = req.params
    const domain = 'localhost:3000'
    const url = 'XSLDK'

    console.log(req.body)

    const shortenedURL = {
        original_url: `${originalURL}`,
        short_url: `${domain}/${url}`,
    }
    res.json(shortenedURL)
})

// listen for requests :)
const listener = app.listen(PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
