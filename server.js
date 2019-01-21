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
        //   connectionString: process.env.DATABASE_URL,
        connectionString: 'postgres://ctwspcxhwwuadk:a80262c817dcca8ffdf6d3e96eb64902e6c6ef4c98c8107bff6dc7dd73d070cd@ec2-107-20-183-142.compute-1.amazonaws.com:5432/df8m6odpsdag5g',
        ssl: true,
    },
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

app.get('/api/shorturl/:id', (req, res) => {
    const { id } = req.params

    db.select('*')
        .from('urls')
        .where('id', '=', id)
        .then(result => {
            const redirectURL = result[0].original_url

            console.log(`Redirecting to: ${redirectURL}`)
            res.redirect(`${redirectURL}`)
        })
        .catch(err => {
            console.log('Error retrieving url with that id')
            res.status(400).json({
                error: 'URL not found',
            })
        })
})

app.post('/api/shorturl/new', (req, res) => {
    // Get the original url
    const originalURL = req.body.url

    // Get the current domain
    const host = req.headers.host

    // TODO: check invalid URL
    if (!validateURL(originalURL)) {
        return res.status(400).json({
            error: 'invalid URL',
        })
    }

    // Insert into database
    insertURL(originalURL)

    // Get the last 'id' inserted in the table 'urls'
    db.select('id')
        .from('urls')
        .orderBy('id', 'DESC')
        .limit(1)
        .then(query => {
            res.json({
                original_url: `${originalURL}`,
                short_url: `${host}/api/shorturl/${query[0].id}`,
            })
        })
        .catch(err => console.log('Couldnt retrieve last inserted id'))
})

const validateURL = originalURL => {
    const regex = /\w+\.\w+\.*\w*/

    return originalURL.match(regex)
}

const insertURL = originalURL => {
    db.transaction(trx => {
        trx.insert({
            original_url: originalURL,
        })
            .into('urls')
            .then(trx.commit)
            .catch(trx.rollback)
    })
}

// listen for requests :)
const listener = app.listen(PORT, () => {
    console.log('Your app is listening on port ' + listener.address().port)
})
