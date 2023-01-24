const router = require('express').Router();

const User = require('../models/user.model');
const Message = require('../models/message.model');

router.get('/', (req, res) => {
  res.redirect('/chat');
})

router.get('/register', (req, res) => {
  res.render('register');
});

router.get('/login', (req, res) => {
  res.render('login');
});

router.get('/chat', async (req, res) => {
  //* Comprobamos si se ha logueado correctamente (si hay cookie es que sí y sino mandamos error que es lo que gestionamos)
  if (!req.cookies['chat_login']) return res.redirect('/login?error=true');
  // console.log(req.cookies['chat_login']); // Vemos la cookie

  //* Recuperamos el usuario
  const user = await User.findById(req.cookies['chat_login']);
  // console.log(user); // Vemos el usuario

  // Recuperamos los últimos 5 mensajes para que me aparezcan en el chat cada vez que abro
  const messages = await Message.find().sort({ createdAt: -1 }).limit(5).populate('user'); // El -1 en createdAt es porque quiero ordenarlo de forma descendente por fecha de creación
  // console.log(messages) // Para ver la estructura de messages


  res.render('chat', { user, messages }); //Estamos haciéndole llegar a la vista (chat.pug) la información del user (user: user)
});

module.exports = router;




