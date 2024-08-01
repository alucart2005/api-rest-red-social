// importar dependencias y modulos
const bcrypt = require("bcrypt");
// Importar modelos
const User = require("../models/user");
// Importar servicios
const jwt = require("../services/jwt");
const followService = require("../services/followService");
const { isValidObjectId } = require("mongoose");
//const mongoosePaginate = require("mongoose-pagination");
const fs = require("fs").promises;
const path = require("path");

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
    // Recibir el parametro del id del usuario por la url
    const id = req.params.id;
    if (!isValidObjectId(id)) {
      return res.status(400).send({
        status: "error",
        message: "ID de usuario no valido",
      });
    }
    // Consultar para sacar los datos del usuario
    const userProfile = await User.findById(id).select({
      password: 0,
      role: 0,
    });
    if (!userProfile) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }

    // Info de seguimiento
    const followInfo = await followService.followThisUser(req.user.id, id);

    return res.status(200).json({
      status: "success",
      userProfile,
      following: followInfo.following,
      follower: followInfo.follower,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "error al obtener perfil del usuario",
    });
  }
};

/* VERSION 2.0 list
const list = async (req, res) => {
  const total = await User.find();
  try {
    // Controlar en que pagina estamos
    let page = 1;
    if (req.params.page) {
      page = req.params.page;
    }
    page = parseInt(page);
    // Consultar mongoose paginate
    let itemsPerPage = 3;
    const users = await User.find().sort("_id").paginate(page, itemsPerPage);
    if (!users.length) {
      return res.status(404).send({
        status: "error",
        message: "No hay usuarios para esta paginacion",
      });
    }
    //Devolver resultado (Posteriormente info follow)
    return res.status(200).send({
      status: "success",
      page: page,
      itemsPerPage: itemsPerPage,
      usersPage: users.length,
      total: total.length,
      pages: `${page} de  ${Math.ceil(total.length / itemsPerPage)}`,
      users: users,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la lista de usuarios",
    });
  }
};*/

// VERSION 2.0 list  -  using mongoose 8.4
const list = async (req, res) => {
  try {
    const usersPerPage = 6; // Define items per page
    const page = parseInt(req.params.page || 1); // Get page number from query string (default to 1)
    const skip = (page - 1) * usersPerPage; // Calculate skip based on page and items per page
    const users = await User.find().select("-email -password -role -__v").sort("_id").skip(skip).limit(usersPerPage);
    // Process and return paginated users
    const totalUsers = await User.countDocuments(); // Count total users
    // Sacar un array de ids de los usuarios que sigo y me siguen
    let followUserIds = await followService.followUserIds(req.user.id);
    return res.status(200).json({
      status: "success",
      page,
      itemsPerPage: users.length,
      pages: Math.ceil(totalUsers / usersPerPage), // Calculate total pages
      totalUsers,
      users,
      following: followUserIds.following,
      followers: followUserIds.followers,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la lista de usuarios",
    });
  }
};
//end   VERSION 2.0 list  -  using mongoose 8.4   */

const update = async (req, res) => {
  try {
    // Recoger info del usuario
    let userIdentity = req.user;
    let userToUpDate = req.body;
    //Eliminar campos sobrantes
    delete userToUpDate.exp;
    delete userToUpDate.iat;
    delete userToUpDate.role;
    delete userToUpDate.image;
    // Comprobar si el ususrio ya existe
    const users = await User.find({
      $or: [
        { email: userToUpDate.email.toLowerCase() },
        { nick: userToUpDate.nick.toLowerCase() },
      ],
    });
    let userIssets = false;
    users.forEach((user) => {
      if (user && user._id != userIdentity.id) userIssets = true;
    });
    if (userIssets) {
      return res.status(400).send({
        status: "error",
        message: "Email o nombre de usuario ya en uso",
      });
    }
    // Cifrar la contraseña
    if (userToUpDate.password) {
      let pwd = await bcrypt.hash(userToUpDate.password, 10);
      userToUpDate.password = pwd;
    }
    // Si me llega la info cifrada
    // Buscar y actualizar
    const userUpdate = await User.findByIdAndUpdate(
      userIdentity.id,
      userToUpDate,
      { new: true }
    );
    //devolver respuesta
    // Exportar acciones
    return res.status(200).send({
      status: "success",
      message: "Metodo actualizar usuario",
      user: userUpdate,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar usuario",
    });
  }
};
/*Version 2.0 update
const update = async (req, res) => {
  try {
    // Extract user data from request body
    const userIdentity = req.user;
    const userUpdates = req.body;
    // Validate incoming data (optional)
    // You might want to validate userUpdates to ensure required fields are present and have valid formats
    // Sanitize email and nick (optional)
    userUpdates.email = userUpdates.email.toLowerCase().trim(); // Sanitize email
    userUpdates.nick = userUpdates.nick.toLowerCase().trim(); // Sanitize nick
    // Exclude unwanted fields from update object
    const allowedUpdates = ["name", "email", "nick", "password"]; // Define allowed update fields
    const filteredUpdates = Object.keys(userUpdates)
      .filter((key) => allowedUpdates.includes(key))
      .reduce((acc, key) => ({ ...acc, [key]: userUpdates[key] }), {});
    // Check for existing email or nick (excluding current user)
    const existingUser = await User.findOne({
      $or: [
        { email: filteredUpdates.email },
        { nick: filteredUpdates.nick },
      ],
      _id: { $ne: userIdentity.id }, // Exclude current user
    });
    if (existingUser) {
      return res.status(400).json({
        status: "error",
        message: "Email o nombre de usuario ya en uso",
      });
    }
    // Hash password if provided
    if (filteredUpdates.password) {
      filteredUpdates.password = await bcrypt.hash(filteredUpdates.password, 10);
    }
    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      userIdentity.id,
      filteredUpdates,
      { new: true } // Return the updated document
    );
    if (!updatedUser) {
      return res.status(404).json({
        status: "error",
        message: "Usuario no encontrado",
      });
    }
    // Return successful update response
    return res.status(200).json({
      status: "success",
      message: "Usuario actualizado exitosamente",
      user: updatedUser,
    });
  } catch (error) {
    console.error(error); // Log the error for debugging
    return res.status(500).json({
      status: "error",
      message: "Error al actualizar usuario",
    });
  }
};
end Version 2.0 update */

const upload = async (req, res) => {
  try {
    // Recoger el fichero de imagen y comprobar que existe
    if (!req.file) {
      return res.status(404).send({
        status: "error",
        message: "Peticion no incluye la imagen",
      });
    }
    // Conseguir el nombre del archivo
    let image = req.file.originalname;
    // Sacar la extension del archivo
    const imageSplit = image.split(".");
    const extension = imageSplit[1];

    // List of allowed extensions
    //const allowedExtensions = ['png', 'jpg', 'jpeg', 'gif'];
    // Check if extension is allowed
    // if (!allowedExtensions.includes(extension))

    // Comprobar la extension
    if (
      extension != "png" &&
      extension != "jpg" &&
      extension != "jpeg" &&
      extension != "gif"
    ) {
      // Si no es correcto borrar el archivo
      const filePath = req.file.path;
      const fileDeleted = fs.unlinkSync(filePath);
      // Devolver respuesta negativa
      return res.status(400).send({
        status: "error",
        message: "Extension invalida",
      });
    }
    // Si si es correcto guardar el archivo en la db
    const userUpdated = await User.findByIdAndUpdate(
      req.user.id,
      { image: req.file.filename },
      { new: true }
    );
    if (!userUpdated) {
      return res.status(404).send({
        status: "error",
        message: "Usuario no encontrado",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      user: userUpdated,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error el subir el Avatar",
    });
  }
};

const avatar = async (req, res) => {
  try {
    // Sacar el parámetro de la url
    const file = req.params.file;
    // Montar el path real de la imagen
    const filePath = path.join("./uploads/avatars", file);
    try {
      await fs.access(filePath);
    } catch (error) {
      return res.status(404).send({
        status: "error",
        message: "No existe la imagen",
      });
    }
    return res.sendFile(path.resolve(filePath));
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al servir el Avatar",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaUser,
  register,
  login,
  profile,
  list,
  update,
  upload,
  avatar,
};
