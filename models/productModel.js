import mongoose from 'mongoose'

const ProductSchema = mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  subCategory: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  imageArray: [
    {
      image: {
        type: String,
      },
    },
  ],
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  },
  price: {
    type: Number,
    required: true,
  },
  disPrice: {
    type: Number,
  },
  qty: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  inStock: {
    type: Boolean,
    required: true,
  },
  gst: {
    type: Number,
    default: 0,
  },
  veg: {
    type: Boolean,
    default: true,
  },
  description: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
  },
  reviews: [
    {
      userId: {
        type: String,
        required: true,
      },
      userName:{
        type: String,
      },
      rating: {
        type: Number,
        required: true,
      },
      review: {
        type: String,
        required: true,
      },
    },
  ],
  isApproved: {
    type: Boolean,
    default: false,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

const Product = mongoose.model('Product', ProductSchema)
export default Product
