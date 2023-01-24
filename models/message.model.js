const { model, Schema } = require('mongoose');

const messageSchema = new Schema({
  text: String,
  user: { type: Schema.Types.ObjectId, ref: 'user' }
}, {
  timestamps: true
});

module.exports = model('message', messageSchema);