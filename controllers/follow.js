const Follow = require("../models/follow");
const User = require("../models/user");

// Importar dependencias
//const mongoosePaginate = require("mongoose-pagination");

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
      message: "Follow eliminado correctanmente",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Problema al intentar dejar de seguir al usuario",
    });
  }
};

// Accion listado de usuarios que cualquier usuario esta siguiendo

/*const following = async (req, res) => {
  // Sacar el id del usuario identificado
  let userId = req.user.id;
  // Comprobar si me llega el id por parametro en url
  if (req.params.id) userId = req.params.id;

  // Comprobar si me llega la pagina, si no la pagina 1
  let page = 1;
  if (req.params.page) page = parseInt(req.params.page);

  // Usuarios por pagina que quiero mostrar
  const itemsPerPage = 5;

  // Find a follow, popular los datos de los usuarios y paginar con mongoose paginate
  const follows = await Follow.find({ user: userId })
    .populate([{ path: "user followed", select: "-password -role -__v" }])
    .paginate(page, itemsPerPage);
  // listado de usuario de X y propios

  // Sacar un array de ids de los usarios que me siguen y sigo

  try {
    return res.status(200).send({
      status: "Success",
      message: "Listado de usuarios seguidos",
      total,
      follows,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Problema al intentar listar usuarios seguidos",
    });
  }
};*/

const following = async (req, res) => {
  try {
    // Sacar el id del usuario identificado
    let userId = req.user.id;
    // Comprobar si me llega el id por parametro en url
    if (req.params.id) userId = req.params.id;
    // Comprobar si me llega la pagina, si no la pagina 1
    let page = 1;
    if (req.params.page) page = parseInt(req.params.page);
    // Usuarios por pagina que quiero mostrar
    const itemsPerPage = 5;

    const options = {
      page: page,
      limit: itemsPerPage,
      populate: [
        { path: "user", select: "-password -role -__v" },
        { path: "followed", select: "-password -role -__v" },
      ],
    };

    const follows = await Follow.paginate({ user: userId }, options);
    
    return res.status(200).send({
      status: "Success",
      message: "Listado de usuarios seguidos",
      "user logueado": req.user.name,
      total: follows.totalDocs,
      pages: follows.totalPages,
      follows: follows.docs,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Problema al intentar listar usuarios seguidos",
      error: error.message,
    });
  }
};

// Accion listado de usuarios que me siguen
const followers = async (req, res) => {
  try {
    return res.status(200).send({
      status: "Success",
      message: "Listado de usuarios que me siguen",
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Problema al intentar listar usuarios que me siguen",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaFollow,
  save,
  unfollow,
  following,
  followers,
};
