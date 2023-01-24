const { model, Schema } = require('mongoose');

// Como primer parámetro le pasamos un objeto con el Schema del usuario y como segundo opciones
const userSchema = new Schema({
  username: String,
  email: String,
  password: String
}, {
  timestamps: true // Recibe las fechas de creación
});

module.exports = model('user', userSchema);