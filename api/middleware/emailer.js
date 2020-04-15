const nodemailer = require('nodemailer')
const mg = require('nodemailer-mailgun-transport')
const i18n = require('i18n')
const User = require('../models/user')
const { itemAlreadyExists } = require('../middleware/utils')

/**
 * Sends email
 * @param {Object} data - data
 * @param {boolean} callback - callback
 */
const sendEmail = async (data, callback) => {
  const auth = {
    auth: {
	  api_key : "",
	  domain: ""
    }
  }
  const transporter = nodemailer.createTransport(mg(auth))
  const mailOptions = {
	from: "mail gun username and address",
	to: "user email",
    subject: data.subject,
    html: data.htmlMessage
  }
  transporter.sendMail(mailOptions, (err) => {
    if (err) {
      return callback(false)
    }
    return callback(true)
  })
}

/**
 * Prepares to send email
 * @param {string} user - user object
 * @param {string} subject - subject
 * @param {string} htmlMessage - html message
 */
const prepareToSendEmail = (item, subject, htmlMessage) => {
  item = {
    name: item.name,
    email: item.email
  }
  const data = {
    item,
    subject,
    htmlMessage
  }

  if (process.env.NODE_ENV === 'production') {
    sendEmail(data, (messageSent) =>
      messageSent
        ? console.log(`Email SENT to: ${item.email}`)
        : console.log(`Email FAILED to: ${item.email}`)
    )
  } else if (process.env.NODE_ENV === 'development') {
    console.log(data)
  }
}

module.exports = {
  
   /**
   * Checks User model if user with an specific email exists
   * @param {string} email - user email
   */
  async emailExists(email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, 'EMAIL_ALREADY_EXISTS')
          resolve(false)
        }
      )
    })
  },

  /**
   * Checks User model if user with an specific email exists but excluding user id
   * @param {string} id - user id
   * @param {string} email - user email
   */
  async emailExistsExcludingMyself(id, email) {
    return new Promise((resolve, reject) => {
      User.findOne(
        {
          email,
          _id: {
            $ne: id
          }
        },
        (err, item) => {
          itemAlreadyExists(err, item, reject, 'EMAIL_ALREADY_EXISTS')
          resolve(false)
        }
      )
    })
  },
  
  
  /**
   * Sends registration email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendRegistrationEmailMessage(locale, user) {
    i18n.setLocale(locale)
    const subject = i18n.__('registration.SUBJECT')
    const htmlMessage = i18n.__(
      'registration.MESSAGE',
      user.name
    )
    prepareToSendEmail(user, subject, htmlMessage)
  },
  
  
  /**
   * Sends Todo Task Creation email
   * @param {string} locale - locale
   * @param {Object} user - user object
   */
  async sendTodoTaskCreationMessage(locale, todo) {
    i18n.setLocale(locale)
    const subject = i18n.__('todoTask.SUBJECT')
    const htmlMessage = i18n.__(
      'todoTask.MESSAGE',
      todo.name
    )
    prepareToSendEmail(todo, subject, htmlMessage)
  }
}
