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
      console.log(pwd);
      params.password = pwd;

      // Crear objeto de usuario
      let user_to_save = new User(params);

      // userStored VERSION 1.0
      // Guardar usuario en la base de datos
      try {
        const userStored = await user_to_save.save();
        if (!userStored) {
          return res.status(500).json({
            status: "error",
            message: "Error al guardar usuario",
          });
        }
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
