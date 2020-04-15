const controller = require('../controllers/auth')
const validate = require('../controllers/auth.validate')
const express = require('express')
const router = express.Router()
require('../config/passport')
const passport = require('passport')
const requireAuth = passport.authenticate('jwt', {
  session: false
})
const trimRequest = require('trim-request')


/*
 * Auth routes
 */

/*
 * Register route
 */
router.post(
  '/register', 
  trimRequest.all, 
  validate.register, 
  controller.register)


/*
 * Login route
 */
router.post(
'/login', 
trimRequest.all, 
validate.login, 
controller.login)

module.exports = router
