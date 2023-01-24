#!/usr/bin/env node

/**
 * Module dependencies.
 */

const app = require('../app');
const debug = require('debug')('chat:server');
const http = require('http');
const Message = require('../models/message.model');

//* Config .env
require('dotenv').config();

//* Config base de datos
require('../config/db');

/**
 * Get port from environment and store in Express.
 */

const port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

const server = http.createServer(app);

//* Justo después de la creación de server vamos a configurar socket.io guardándolo en una variable
//*Config Socket.io (le tenemos que pasar el server que hemos creado en la línea de arriba)
const io = require('socket.io')(server);

//* Sobre io aplicamos el método on() propio de io. Le estamos diciendo que cuando detecte el evento on connection lance la función que le ponemos pasando como parametro siempre socket que es el canal que une la conexión
// * on() es un método clave para capturar eventos
io.on('connection', (socket) => {
  // console.log('Se ha conectado un nuevo cliente');
  socket.broadcast.emit('chat_message', {  // Con broadcast emitimos a todos excepto al que acaba de conectarse (que es quien está interactuando con el socket)
    text: 'Se ha conectado un nuevo usuario',
    user: { username: 'INFO' } // El usuario que dice que se ha conectado un nuevo usuario es "INFO"
  });

  // console.log(io.engine.clientsCount); // Vemos la terminal el número de clientes que está conectado
  io.emit('chat_users', io.engine.clientsCount);

  socket.on('chat_message', async (data) => {
    // console.log(data) // Vamos a ver los datos que está enviando el cliente (el objeto (obj) que hemos generado)
    //* En este punto podemos guardar los mensajes que se están escribiendo en la base de datos. Hay que crear un nuevo mensaje(con el cuerpo que le hemos puesto en el messageSchema) y guardarlo en una variable
    // data contiene: message, username, user_id
    const message = await Message.create({
      text: data.message,
      user: data.user_id
    });

    // Lo mismo que me está entrando lo emito al resto
    io.emit('chat_message', await message.populate('user')); // El método populate podemos desplegar las relaciones que tenemos hechas entre las diferentes bases de datos. IMPORTANTE DEVUELVE PROMESA
  });

  socket.on('disconnect', (reason) => { // En la documentación de socket aparece el evento disconnect y pasarle el parámetro reason
    // console.log('REASON', reason); // Devuelve esto -> REASON transport close
    io.emit('chat_message', {
      text: 'Se ha desconectado un usuario',
      user: { username: 'INFO' }
    });
    io.emit('chat_users', io.engine.clientsCount); // Actualizo el número de usuarios que quedan en el chat
  });
});

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}
