const paypal = require('paypal-rest-sdk')
require('dotenv').config()

// Import paypal mode from .env file
const mode = process.env.MODE || 'sandbox'

// Configure paypal client_id & client_secret
paypal.configure({
  'mode': mode,
  'client_id': mode === 'sandbox' ? process.env.CLIENT_ID : process.env.LIVE_CLIENT_ID,
  'client_secret': mode === 'sandbox' ? process.env.CLIENT_SECRET : process.env.LIVE_CLIENT_SECRET
});

// Send donation to paypal
const getDonate = (req, res) => {
  const payments = {
    "intent": "sale",
    "payer": {
        "payment_method": "paypal"
    },
    "redirect_urls": {
        "return_url": process.env.RETURN_URL || "http://localhost:3000/return",
        "cancel_url": process.env.CANCEL_URL || "http://localhost:3000/cancel"
    },
    "transactions": [{
        "item_list": {
            "items": [{
                "name": "Donation",
                "sku": "001",
                "price": "1.00",
                "currency": "USD",
                "quantity": 1
            }]
        },
        "amount": {
            "currency": "USD",
            "total": "1.00"
        },
        "description": "Supporting open source programming."
    }]
  };

  paypal.payment.create(payments, (error, payment) => {
    if (error) {
      throw error;
    } else {
      for(let i = 0; i < payment.links.length; i++){
        if(payment.links[i].rel === 'approval_url'){
          res.redirect(payment.links[i].href);
        }
      }
    }
  })
}

// get success from paypal and render success page
const sendSuccess = (req, res) => {
  const payerID = req.query.PayerID;
  const paymentID = req.query.paymentId;

  const payments = {
    "payer_id": payerID,
    "transactions": [{
      "amount": {
        "currency": "USD",
        "total": "1.00"
      }
    }]
  }

  paypal.payment.execute(paymentID, payments, (error, payment) => {
    if (error) {
      throw error;
    } else {
      res.render('success', payment);
    }
  })
}

module.exports = { getDonate, sendSuccess }