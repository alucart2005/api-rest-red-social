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
    const identity = req.user;
    // Crear objeto con modelo follow
    let userToFollow = new Follow({
      user: identity.id,
      followed: params.followed,
    });

    // Guardar objeto en db
    const followStorage = await userToFollow.save();

    return res.status(200).send({
      status: "Success",
      identity: identity,
      follow: followStorage,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al seguir al usuario.",
    });
  }
};

// Accion de borrar un follow (accion dejar de seguir)
const unfollow = async (req, res) => {
  try {
    // Recoger el id del usuario identificado
    const userId = req.user.id;

    // Recoger el id del usuario que sigo y quiero dejar de seguir
    const followedId = req.params.id;

    // Encontrar las coincidencias y dejar de seguir
    const followDelete = await Follow.deleteMany({
      user: userId,
      followed: followedId,
    });
    return res.status(200).send({
      status: "Success",
      message:"Follow eliminado correctanmente",
      identity: req.user.name,
      followDelete,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Problema al intentar dejar de seguir al usuario",
    });
  }
};
// Accion listado de usuarios que estoy siguiendo
// Accion listado de usuarios que me siguen

//Exportar acciones
module.exports = {
  pruebaFollow,
  save,
  unfollow,
};
