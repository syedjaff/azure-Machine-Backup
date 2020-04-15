const model = require('../models/todo')
const { matchedData } = require('express-validator')
const utils = require('../middleware/utils')
const db = require('../middleware/db')
const emailer = require('../middleware/emailer')
const WebSocket = require('ws')
const wss = new WebSocket.Server({port: 40510})

/**
 * Checks if a todo already exists excluding itself
 * @param {string} id - id of item
 * @param {string} name - name of item
 */
const todoExistsExcludingItself = async (id, name) => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        name,
        _id: {
          $ne: id
        }
      },
      (err, item) => {
        utils.itemAlreadyExists(err, item, reject, 'todo_ALREADY_EXISTS')
        resolve(false)
      }
    )
  })
}

/**
 * Checks if a todo already exists in database
 * @param {string} name - name of item
 */
const todoExists = async (name) => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        name
      },
      (err, item) => {
        utils.itemAlreadyExists(err, item, reject, 'todo_ALREADY_EXISTS')
        resolve(false)
      }
    )
  })
}

/**
 * Gets all items from database
 */
const getAllItemsFromDB = async () => {
  return new Promise((resolve, reject) => {
    model.find(
      {},
      '-updatedAt -createdAt',
      {
        sort: {
          name: 1
        }
      },
      (err, items) => {
        if (err) {
          reject(utils.buildErrObject(422, err.message))
        }
        resolve(items)
      }
    )
  })
}


/**
 * Checks if verification id exists for 
 * @param {string} id - verification id
 */
const verificationExists = async (id) => {
  return new Promise((resolve, reject) => {
    model.findOne(
      {
        _id: id,
        isCompleted: false
      },
      (err, todo) => {
        utils.itemNotFound(err, todo, reject, 'NOT_FOUND_OR_ALREADY_STATUS_CHANGED_COMPLETED')
        resolve(todo)
      }
    )
  })
}


/**
 * Completes an Item
 * @param {Object} user - todo object
 */
const changeStatus = async (todo) => {
  return new Promise((resolve, reject) => {
	todo.isCompleted = true
    todo.save((err, item) => {
      if (err) {
        reject(utils.buildErrObject(422, err.message))
      }
      resolve(item)
    })
  })
}


/**
 * Get all items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getAllItems = async (req, res) => {
  try {
    res.status(200).json(await getAllItemsFromDB())
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get items function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItems = async (req, res) => {
  try {
    const query = await db.checkQueryString(req.query)
    res.status(200).json(await db.getItems(req, model, query))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Get item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.getItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.getItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Update item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.updateItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    const doestodoExists = await todoExistsExcludingItself(id, req.name)
    if (!doestodoExists) {
      res.status(200).json(await db.updateItem(id, model, req))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Create item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.createItem = async (req, res) => {
  try {
	/*Gets locale from header 'Accept-Language'*/
    const locale = req.getLocale()
	req = matchedData(req)
    const doestodoExists = await todoExists(req.name)
    if (!doestodoExists) {
	  wss.on('connection',(ws) => {
		ws.on('message',(message) => {
			console.log('Web Socket Server Connected...')
			console.log('Message received: %s', message)
			console.log('Notification Sent')
		  });
		  ws.send('Todo Task Created Successfully..!')
		  ws.close()
	  })
      emailer.sendTodoTaskCreationMessage(locale, req)
	  res.status(201).json(await db.createItem(req, model))
    }
  } catch (error) {
    utils.handleError(res, error)
  }
}

/**
 * Delete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.deleteItem = async (req, res) => {
  try {
    req = matchedData(req)
    const id = await utils.isIDGood(req.id)
    res.status(200).json(await db.deleteItem(id, model))
  } catch (error) {
    utils.handleError(res, error)
  }
}


/**
 * Complete item function called by route
 * @param {Object} req - request object
 * @param {Object} res - response object
 */
exports.completeItem = async (req, res) => {
  try {
    req = matchedData(req)
    const todo = await verificationExists(req.id)
    res.status(200).json(await changeStatus(todo))
  } catch (error) {
    utils.handleError(res, error)
  }
}
