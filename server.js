import express from 'express'
import dotenv from 'dotenv'
import colors from 'colors'
import cors from 'cors'
import connectDB from './config/db.js'
import bodyParser from 'body-parser'
import vendorRoutes from './routes/vendorRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import userRoutes from './routes/userRoutes.js'
dotenv.config()
const app = express()
// app.use(
//   bodyParser.urlencoded({
//     extended: true,
//   })
// )
app.use(
  bodyParser.json({
    extended: true,
  })
)
connectDB()
app.use(cors())

app.get('/', (req, res) => {
  res.send('API is running..')
})
// app.use('/api/products', productRoutes)
app.use('/api/vendor', vendorRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/user', userRoutes)
// app.use('/api/orders', orderRoutes)

// app.get('/api/config/paypal', (req, res) =>
//   res.send(process.env.PAYPAL_CLIENT_ID)
// )

// //*middleware for no route found
// app.use(notFound)

// //* This middleware will be used to handle errors
// app.use(errorHandler)

//* Start the server
const PORT = process.env.PORT || 5000
app.listen(PORT, () =>
  console.log(
    `Server started in ${process.env.NODE_ENV} on port ${PORT}`.yellow.bold
  )
)
