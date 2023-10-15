import mongoose from 'mongoose'

import geocoder from '../utils/geocoder.js'

const OrderSchema = mongoose.Schema(
  {
    products: [
      {
        // id: {
        //   type: String,
        //   required: true,
        // },

        prodId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        prodImage: {
          type: String,
          default: '',
        },
        quantity: {
          type: Number,
          required: true,
        },
        // price: {
        //   type: Number,
        //   required: true,
        // },
      },
    ],
    // vendorId: {
    //   type: String,

    // },
    // userId: {
    //   type: String,
    //   required: true,
    // },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    name:{
      type:String,
      default: ''
    },
    phoneNo:{
      type: Number,
      default: 0,
    },
    altphoneNo:{
      type: Number,
      default: 0,
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Vendor',
    },
    storeName: {
      type: String,
      required: true,
    },
    subTotal: {
      type: Number,
      default: 0,
    },
    total: {
      type: Number,
      default: 0,
    },
    gst: {
      type: Number,
      default: 0,
    },
    discount: {
      type: Number,
      default: 0,
    },
    deliveryCharge: {
      type: Number,
      default: 0,
    },
    deliveryAddress: {
      type: String,
      required: false,
    },
    deliveryLocation: {
      type: {
        type: String,
        enum: ['Point'],
      },
      coordinates: {
        type: [Number],
        index: '2dsphere',
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      pinCode: String,
    },
    paymentMethod: {
      type: String,
      required: false,
    },
    paymentResult: {
      id: { type: String },
      status: { type: String },
      update_time: { type: String },
      email_address: { type: String },
    },
    isPaid: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      default: false,
    },
    isAccepted: {
      type: Boolean,
      default: false,
    },
    isRejected: {
      type: Boolean,
      default: false,
    },
    isCancelled: {
      type: Boolean,
      default: false,
    },

    deliveredAt: {
      type: Date,
    },
  },

  { timestamps: true }
)

OrderSchema.pre('save', async function (next) {
  const loc = await geocoder.geocode(this.deliveryAddress)
  //   const pick = await geocoder.geocode(this.pickupAddress)

  this.deliveryLocation = {
    type: 'Point',
    coordinates: [loc[0].longitude, loc[0].latitude],
    city: loc[0].city,
    state: loc[0].stateCode,
    pinCode: loc[0].zipcode,

    formattedAddress: loc[0].formattedAddress,
  }
  //   this.pickuplocation = {
  //     type: 'Point',
  //     coordinates: [pick[0].longitude, pick[0].latitude],
  //     formattedAddress: pick[0].formattedAddress,
  //   }
  next()
})

const Order = mongoose.model('Order', OrderSchema)
export default Order
