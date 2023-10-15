require('dotenv').config()
const asyncHandler = require('express-async-handler')
const twilio = require('twilio')
const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_ACCOUNT_TOKEN
)
//create verification service
// const createService = asyncHandler(async (req, res) => {
//   try {
//     await client.verify.services
//       .create({ friendlyName: 'phoneVerification' })
//       .then((service) => console.log(service.sid))
//   } catch (error) {
//     console.log(error)
//   }
// })

// createService()
//after createService function creation

//send verification code token
const sendVerification = asyncHandler(async (number) => {
  try {
    // await client.messages
    //   .create({ body: 'Hi there', from: '+15626205969', to: `${number}` })
    //   .then((message) => console.log(message.sid))
    await client.verify
      .services(process.env.TWILIO_VERIFICATION_SID)
      .verifications.create({ to: `${number}`, channel: 'sms' })
      .then((verification) => {
        return verification.status
      })
  } catch (error) {
    console.log(error.message)
    return error.message
  }
})

//check verification token
const checkVerification = asyncHandler(async (number, code) => {
  try {
    return new Promise((resolve, reject) => {
      client.verify
        .services(process.env.TWILIO_VERIFICATION_SID)
        .verificationChecks.create({ to: `${number}`, code: `${code}` })
        .then((verification_check) => {
          console.log(verification_check.status)
          resolve(verification_check.status)
        })
    })
  } catch (error) {
    console.log(error.message)
    return error.message
  }
})

module.exports = {
  sendVerification,
  checkVerification,
}
