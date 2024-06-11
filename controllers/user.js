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
      // Control de usuarios duplicados
      const users = await User.find({
        $or: [
          { email: params.email.toLowerCase() },
          { nick: params.nick.toLowerCase() },
        ],
      });
      if (users && users.length >= 1) {
        return res.status(409).json({
          status: "error",
          message: "El usuario ya existe",
        });
      }
      // Cifrar la contraseña
      let pwd = await bcrypt.hash(params.password, 10);
      params.password = pwd;

      // Crear objeto de usuario
      let user_to_save = new User(params);

      // userStored VERSION 1.0
      // Guardar usuario en la base de datos
      try {
        const userStored = await user_to_save.save();
        // Devolver resultado
        return res.status(200).json({
          status: "success",
          message: "Usuario registrado correctamente",
          userStored,
        });
      } catch (error) {
        return res.status(500).json({
          status: "error",
          message: "Error al guardar usuario",
        });
      }

      /* userStored VERSION 2.0
      try {
        const userStored = await user_to_save.save();

        // Handle successful save with informative response
        return res.status(201).json({
          status: "success",
          message: "Usuario creado correctamente",
          user: userStored, // Use "user" instead of "userStored" for clarity
        });
      } catch (error) {
        console.error(error); // Log the error for debugging

        // Provide a more specific error message if possible (optional)
        let errorMessage = "Error al guardar usuario";
        if (error.name === "ValidationError") {
          errorMessage = "Error de validación: " + error.message;
        } else if (error.code === 11000) {
          // Handle potential duplicate key error (MongoDB)
          errorMessage = "El usuario ya existe";
        }

        // Return informative error response
        return res.status(400).json({
          status: "error",
          message: errorMessage,
        });
      }
      */
    }
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error en la consulta de usuarios",
    });
  }
};

const login = async (req, res) => {
  try {
    // Recoger parametros
    let params = req.body;
    if (!params.email || !params.password) {
      return res.status(400).send({
        status: "error",
        mensaje: "Faltan datos por enviar",
      });
    }

    // buscar en la db si existe
    const user = await User.findOne({ email: params.email });
    //.select({password: 0,});
    if (!user) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no existe !!!",
      });
    }

    // Comprobar contraseña
    let pwd = bcrypt.compareSync(params.password, user.password);
    console.log(pwd)
    if (!pwd) {
      return res.status(400).json({
        status: "error",
        message: "Password errado",
      });
    }

    // Devolver Token

    // Eliminar password del objeto

    // Deveolver datos del usuario

    return res.status(200).json({
      status: "Success",
      message: "Accion de login",
      user,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "error login",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
};
