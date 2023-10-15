import mongoose from 'mongoose'


const WishlistSchema = mongoose.Schema(
  {
    products: [
      {
        prodId: {
          type: mongoose.Schema.Types.ObjectId,
          required: true,
          ref: 'Product',
        },
        prodName: {
            type: String,
            required: true,
        },
        prodImage: {
          type: String,
          default: '',
        },
        price: {
          type: Number,
          required: true,
        },
        disPrice: {
          type: Number,
        },
      },
    ],
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },

  { timestamps: true }
)


const Wishlist = mongoose.model('Wishlist', WishlistSchema)
export default Wishlist
