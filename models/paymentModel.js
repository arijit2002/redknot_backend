import mongoose from 'mongoose'

const paymentSchema = new mongoose.Schema({
  paymentId: {
    type: String,
    required: true,
  },
  paymentSs: {
    type: String,
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Vendor',
  },
  receivedOn: {
    type: Date,
    required: true,
  },
  amount: {
    type: String,
    required: true,
  },
  isEmployeePayment: {
    type: Boolean,
    required: true,
  },
  employeeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Employee',
  },
})

const Payment = mongoose.model('Payment', paymentSchema)
export default Payment
