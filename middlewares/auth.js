import jwt from 'jsonwebtoken'
import User from '../models/userModel.js'

const userAuth = async (req, res, next) => {
  let token = req.headers.authorization.split(' ')[1]
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' })
  }
  try {
    const userId = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(userId.id).select('-password')
    if (!user) {
      return res.status(401).json({ msg: 'User not found' })
    }

    req.user = user
    next()
  } catch (err) {
    console.log(err)
    res.status(401).json({ msg: 'Token is not valid' })
  }
}

export { userAuth }
