const router = require('express').Router();
const bcrypt = require('bcryptjs');

const User = require('../models/user.model');


router.post('/create', async (req, res) => {

  req.body.password = bcrypt.hashSync(req.body.password, 7);

  try {
    await User.create(req.body);
  } catch (error) {
    console.log(error);
  }

  // En este ejemplo estamos haciendo una interacción con una página web así que si esto funciona hacemos un redirect a la url que queremos
  res.redirect('/login');
});

router.post('/login', async (req, res) => {

  //* Compruebo si el email está en la BD
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.redirect('/login?error=true'); // En esta redirección le podríamos mandar un mensaje de diferente tipo para decirle que ha habido un error. Con req.query recuperaríamos el error de la url y podríamos mostrarle un error (como ya hicimos en TiendaOnline)


  //* Compruebo si las password coinciden
  const iguales = bcrypt.compareSync(req.body.password, user.password);
  if (!iguales) return res.redirect('/login?error=true'); // En esta redirección le podríamos mandar un mensaje de diferente tipo para decirle que ha habido un error


  //* El login ha ido bien
  res.cookie('chat_login', user._id); // el primer parámetro es cómo vamos a llamar a esa cookie y el segundo lo que voy a guardar. Se está haciendo desde el código del servidor
  res.redirect('/chat');
});


module.exports = router;



