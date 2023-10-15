import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
const Address = mongoose.Schema({
  streetName: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pinCode: { type: String, required: true },
})
const vendorSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    storeName: {
      type: String,
      required: true,
    },
    phoneNo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },

    address: {
      type: Address,
      required: true,
    },
    licenseNo: {
      type: String,
      required: true,
    },
    storeImage: { type: String },
    storeCategory: { type: String },
    gst: { type: String },
    pan: { type: String },
    bankName: { type: String, required: true },
    accountHolder: { type: String, required: true },
    accountNo: { type: String, required: true },
    ifsc: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const UpdatedVendor = mongoose.model('UpdatedVendor', vendorSchema)

export default UpdatedVendor
