const Follow = require("../models/follow");
const User = require("../models/user");

// acciones de prueba
const pruebaFollow = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/follow.js",
  });
};

// Accion de guardar un follow(accion seguir)
const save = async (req, res) => {
  try {
    //Conseguir datos por body
    const params = req.body;
    // Sacar id del usuario identificado
    const identity = req.user
    // Crear objeto con modelo follow
    // Guardar objeto en db

    return res.status(200).send({
      status: "Success",
      message: "Every things is OK !!!",
      identity: req.user,
      params
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error el subir el Avatar",
    });
  }
};
// Accion de borrar un follow (accion dejar de seguir)
// Accion listado de usuarios que estoy siguiendo
// Accion listado de usuarios que me siguen

//Exportar acciones
module.exports = {
  pruebaFollow,
  save,
};
