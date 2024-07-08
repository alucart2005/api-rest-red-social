const Publication = require("../models/publication");

// acciones de prueba
const pruebaPublication = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controller/publication.js",
  });
};

// Guardar publicaciones
// Listar una publicacion en concreto
// Eliminar publicaciones
// Listar todas las publicaciones
// Listar publicaciones de un usuario
// Subir ficheros
// Devolver archivos multimedia

//Exportar acciones
module.exports = {
  pruebaPublication,
};
