const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const validator = require('validator')
const mongoosePaginate = require('mongoose-paginate-v2')

const TodoSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
   
	isCompleted: {
      type: Boolean,
      default: false
    }
  },
  {
    versionKey: false,
    timestamps: true
  }
)

TodoSchema.plugin(mongoosePaginate)
module.exports = mongoose.model('Todo', TodoSchema)
