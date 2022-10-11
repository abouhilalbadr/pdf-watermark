const express = require('express')
const cors = require('cors')
const path = require('path')
const expressLayouts = require('express-ejs-layouts')

require('dotenv').config()

const app = express()

// get port from .env
const port = process.env.PORT || 3000

// Import routes
const indexRouter = require('./routes/index')

// Set the view engine 'ejs' 
app.set('view engine', 'ejs')

// Set the views folder
app.set('views', path.join(__dirname, 'views'))

// Set the default layout file
app.set('layout', 'layouts/layout')

// Use public folder as static folder
app.use(express.static(path.join(__dirname, 'public')))

// Use express ejs Layout
app.use(expressLayouts)

// Use CORS
app.use(cors())

// Use JSON req/res
app.use(express.json())

// Use url endcoded
app.use(express.urlencoded({
  extended: true
}))

// Use Routes from routes folder
app.use('/', indexRouter)

// Listen to the app port
app.listen(port, () => {
  console.log(`Easy Watermark listening at http://localhost:${port}`)
})