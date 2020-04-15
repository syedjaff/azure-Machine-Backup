const jwt = require('jsonwebtoken')
const User = require('../models/user')
const utils = require('../middleware/utils')
const { addHours } = require('date-fns')
const { matchedData } = require('express-validator')
const auth = require('../middleware/auth')
const emailer = require('../middleware/emailer')

/**
 * Generates a token
 * @param {Object} user - user object
 */
const generateToken = (user) => {
  /* Gets expiration time */
  const expiration =
	Math.floor(Date.now() / 1000) + 60 * 4320
	

 /*returns signed and encrypted token*/
  return auth.encrypt(
    jwt.sign(
      {
        data: {
          _id: user
        },
        exp: expiration
      },
      "ThisIsMyCodeThatSecureRoutesInMyApp"
    )
  )
}

/**
 * Creates an object with user info
 * @param {Object} req - request object
 */
const setUserInfo = (req) => {
  let user = {
    _id: req._id,
    name: req.name,
    email: req.email,
	role: req.role
  }
  return user
}



/**
 * Finds user by email
 * @param {string} email - user´s email
 */
const findUser = async (email) => {
  return new Promise((resolve, reject) => {
    User.findOne(
      {
        email
      },
      'email password verification',
      (err, item) => {
        utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST')
        resolve(item)
      }
    )
  })
}

/**
 * Finds user by ID
 * @param {string} id - user´s id
 */
const findUserById = async (userId) => {
  return new Promise((resolve, reject) => {
    User.findById(userId, (err, item) => {
      utils.itemNotFound(err, item, reject, 'USER_DOES_NOT_EXIST')
      resolve(item)
    })
  })
}


/**
 * Registers a new user in database
 * @param {Object} req - request object
 */
const registerUser = async (req) => {
  return new Promise((resolve, reject) => {
    const user = new User({
      name: req.name,
      email: req.email,
      password: req.password,
	  role: req.role
    })
    user.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}

/**
 * Builds the registration token
 * @param {Object} item - user object that contains created id
 * @param {Object} userInfo - user object
 */
const returnRegisterToken = (item, userInfo) => {
  const data = {
    token: generateToken(item._id),
    user: userInfo
  }
  return data
}

/**
 * Checks against user if has quested role
 * @param {Object} data - data object
 * @param {*} next - next callback
 */
const checkPermissions = async (data, next) => {
  return new Promise((resolve, reject) => {
    User.findById(data.id, (err, result) => {
      utils.itemNotFound(err, result, reject, 'NOT_FOUND')
      if (data.roles.indexOf(result.role) > -1) {
        return resolve(next())
      }
      return reject(utils.buildErrObject(401, 'UNAUTHORIZED'))
    })
  })
}

/**
 * Saves a new user access and then returns token
 * @param {Object} req - request object
 * @param {Object} user - user object
 */

const saveUserAccessAndReturnToken = async (req, user) => {
  return new Promise((resolve, reject) => {
      const userInfo = setUserInfo(user)
      resolve({
        token: generateToken(user._id),
        user: userInfo
      })
  })
}


/**
 * Login function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.login = async (req, res) => {
  try {
    const data = matchedData(req)
    const user = await findUser(data.email)
    const isPasswordMatch = await auth.checkPassword(data.password, user)
    if (!isPasswordMatch) {
      utils.handleError(res, error)
    } else {
      res.status(200).json(await saveUserAccessAndReturnToken(req, user))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Register function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.register = async (req, res) => {
  try {
    // Gets locale from header 'Accept-Language'
    const locale = req.getLocale()
	req = matchedData(req)
    const doesEmailExists = await emailer.emailExists(req.email)
    if (!doesEmailExists) {
      const item = await registerUser(req)
      const userInfo = setUserInfo(item)
      const response = returnRegisterToken(item, userInfo)
      emailer.sendRegistrationEmailMessage(locale, item)
      res.status(201).json(response)
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Roles authorization function called by route
 * @param {Array} roles - roles specified on the route
 */
exports.roleAuthorization = (roles) => async (req, res, next) => {
  try {
    const data = {
      id: req.user._id,
      roles
    }
    await checkPermissions(data, next)
  } catch (error) {
    utils.handleError(res, error)
  }
}
