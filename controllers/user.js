// importar dependencias y modulos
const User = require("../models/user");
const bcrypt = require("bcrypt");

// acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
  });
};

// Registro de usuarios
const register = async (req, res) => {
  try {
    // Recoger datos de la peticion
    const params = req.body;

    // Comprobar que me llegan bien (+Validacion)
    if (!params.name || !params.email || !params.password || !params.nick) {
      return res.status(400).json({
        status: "error",
        message: "Faltan datos por enviar",
      });
    } else {
      // Crear objeto de usuario
      let user_to_save = new User(params);

      // Control de usuarios duplicados
      const users = await User.find({
        $or: [
          { email: user_to_save.email.toLowerCase() },
          { nick: user_to_save.nick.toLowerCase() },
        ],
      });
      if (users && users.length >= 1) {
        return res.status(409).json({
          status: "error",
          message: "El usuario ya existe",
        });
      }
      // Cifrar la contraseña
      let pwd = await bcrypt.hash(user_to_save.password, 10);
      console.log(pwd);

      // Guardar usuario en la base de datos

      // Devolver resultado

      return res.status(200).json({
        status: "Success",
        message: "Accion de registro de usuario",
        user_to_save,
      });
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la consulta de usuarios",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
};
