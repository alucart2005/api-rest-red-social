// importar dependencias y modulos
const User = require("../models/user");

// acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
  });
};

// Registro de usuarios
const register = (req, res) => {
  // Recoger datos de la peticion
  const params = req.body;

  // Comprobar que me llegan bien (+Validacion)
  if (!params.name || !params.email || !params.password || !params.nick) {
    return res.status(400).json({
      status: "error",
      message: "Faltan datos por enviar",
    });
  }

  // Crear objeto de usuario
  let user_to_save = new User(params)

  // Control de usuarios duplicados

  // Cifrar la contraseña

  // Guardar usuario en la base de datos

  // Devolver resultado
  return res.status(200).json({
    status: "Success",
    message: "Accion de registro de usuario",
    user_to_save
  });
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
};
