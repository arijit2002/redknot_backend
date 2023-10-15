import mongoose from 'mongoose'
import dotenv from 'dotenv'
import colors from 'colors'
import vendors from './data/vendor.js'

import Vendor from './models/vendorModel.js'
// import Product from './models/productModel.js'
// // import Order from './models/orderModel.js'
import connectDB from './config/db.js'

dotenv.config()
connectDB()

const importData = async () => {
  try {
    await Vendor.deleteMany()

    const createdVendor = await Vendor.insertMany(vendors)

    // await Product.insertMany(sampleProducts)
    console.log('Data imported successfully'.green.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

const destroyData = async () => {
  try {
    await Order.deleteMany()
    await Product.deleteMany()
    await vendor.deleteMany()

    console.log('Data deleted successfully'.red.inverse)
    process.exit()
  } catch (error) {
    console.error(`${error}`.red.inverse)
    process.exit(1)
  }
}

if (process.argv[2] === '-d') {
  destroyData()
} else {
  importData()
}
