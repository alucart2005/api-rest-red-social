// importar dependencias y modulos
const bcrypt = require("bcrypt");
// Imortar modelos
const User = require("../models/user");
// Importar servicios
const jwt = require("../services/jwt");
const { isValidObjectId } = require("mongoose");

// acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controllers/user.js",
    usuario: req.user,
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
    const pwd = bcrypt.compareSync(params.password, user.password);
    console.log(pwd);
    if (!pwd) {
      return res.status(400).json({
        status: "error",
        message: "Password errado",
      });
    }

    // Devolver Token
    const token = jwt.createToken(user);

    // Develver datos del usuario
    return res.status(200).json({
      status: "Success",
      message: "Te has identificado correctamente",
      user: {
        name: user.name,
        nick: user.nick,
      },
      token,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "error login",
    });
  }
};

const profile = async (req, res) => {
  try {
    // Recibir el parametro del id< del usuario por la url
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).send({
        status: "error",
        message: "ID de usuario no valido",
      });
    }
    // Consultar para sacar los datos del usuario
    const userProfile = await User.findById(id).select({password:0, role:0});
    if (!userProfile) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }
    // Devolver datos del usuario
    // Posteriormente devolver informacion de follows
    return res.status(200).json({
      status: "success",
      userProfile,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "error al obtener perfil del usuario",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
};
