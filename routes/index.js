const multer = require("multer")
const express = require('express')
const router = express.Router()

const { getDonate, sendSuccess } = require('./paypal')
const addWatermark = require('./watermark')

const upload = multer({
  storage: multer.memoryStorage({
    destination: function (req, file, callback) {
      callback(null, "")
    },
  }),
})

// Render the home page
router.get('/', (req, res) => res.render('index'))

// Render cancel page
router.get('/cancel', (req, res) => res.render('cancel'))

// Render return page
router.get('/return', (req, res) => res.render('index'))

// Send paypal donation
router.post('/donate', getDonate)

// Get success from paypal and render success page
router.get('/success', sendSuccess)

// Add Watermark to PDF
router.post('/watermark', upload.single('file'), addWatermark)

module.exports = router