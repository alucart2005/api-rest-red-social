// Importar modulos
const fs = require("fs").promises;
const path = require("path");
// Importar modelos
const Publication = require("../models/publication");
// Importar servicios
const servicios = require("../services/followService");

// acciones de prueba
const pruebaPublication = (req, res) => {
  return res.status(200).send({
    message: "Mensaje enviado desde: controller/publication.js",
  });
};

// Guardar publicaciones
const save = async (req, res) => {
  try {
    const params = req.body;
    if (!params.text) {
      return res.status(400).send({
        status: "error",
        message: "Debes enviar el texto de la publicacion",
      });
    }

    const newPublication = new Publication(params);
    newPublication.user = req.user.id;

    const publicationStored = await newPublication.save();
    if (!publicationStored) {
      return res.status(400).send({
        status: "error",
        message: "No se ha guardado la publicacion.",
      });
    }

    return res.status(200).send({
      status: "Success",
      message: "Publicacion guardada",
      publicationStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al guardar publicacion",
    });
  }
};

// Listar una publicacion en concreto
const detail = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publicationStored = await Publication.findById(publicationId);
    // Verificar si la publicación existe
    if (!publicationStored) {
      return res.status(404).json({
        status: "error",
        message: "Publicación no encontrada",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Mostrar publicacion",
      publication: publicationStored,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener la publicación",
    });
  }
};

//Eliminar publicaciones
const remove = async (req, res) => {
  try {
    const publicationId = req.params.id;
    const publication = await Publication.findOne({
      _id: publicationId,
      user: req.user.id,
    });
    console.log(publication);
    if (!publication) {
      return res.status(404).json({
        status: "error",
        message: "Publicacion no encontrada",
      });
    }
    await Publication.deleteOne({ _id: publicationId });
    return res.status(200).send({
      status: "success",
      message: "Publicacion Eliminada",
      publicationId,
    });
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "Error al eliminar la publicacion",
      loged: req.user.id,
    });
  }
};

// Listar publicaciones de un usuario
const user = async (req, res) => {
  try {
    const userId = req.params.id;

    // Controlar la pagina
    let page = 1;
    if (req.params.page) page = parseInt(req.params.page);
    const itemPerPage = 5;
    // Find, populate, ordenar
    const options = {
      page: page,
      limit: itemPerPage,
      sort: { _id: 1 },
      populate: [{ path: "user", select: "-password -role -__v" }],
    };

    const publications = await Publication.paginate({ user: userId }, options);
    if (publications.totalDocs === 0) {
      return res.status(404).json({
        status: "error",
        message: "No se encontraron publicaciones para este usuario",
      });
    }
    return res.status(200).send({
      status: "success",
      message: "Publicaciones recuperadas con éxito",
      "user logueado": req.user.name,
      totalDocs: publications.totalDocs,
      page: publications.page,
      totalPages: publications.totalPages,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al recuperar publicaciones",
    });
  }
};

// Subir ficheros
const upload = async (req, res) => {
  try {
    const publicationId = req.params.id;
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
    const publicationUpdate = await Publication.findOneAndUpdate(
      { user: req.user.id, _id: publicationId },
      { file: req.file.filename },
      { new: true }
    );
    if (!publicationUpdate) {
      return res.status(404).send({
        status: "error",
        message: "Publicacion no encontrada",
      });
    }
    // Devolver respuesta
    return res.status(200).send({
      status: "success",
      publication: publicationUpdate,
      file: req.file,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error el subir imagen de la Publicacion",
    });
  }
};

// Devolver archivos multimedia
const media = async (req, res) => {
  try {
    // Sacar el parámetro de la url
    const file = req.params.file;
    // Montar el path real de la imagen
    const filePath = path.join("./uploads/publications/", file);
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

// Listar todas las publicaciones
const feed = async (req, res) => {
  try {
    //let page = 1;
    //if (req.params.page) page = req.params.page;
    const page = req.params.page ? req.params.page : 1;
    let itemsPerPage = 5;

    const myFollows = await servicios.followUserIds(req.user.id);



    const options = {
      page,
      limit: itemsPerPage,
      sort: { _id: 1 },
      populate: [
        {
          path: "user",
          select: "-password -role -__v",
        },
      ],
    };



    // const publications = await Publication.find({
    //   user: myFollows.following
    // })


    const publications = await Publication.paginate(
      { user: { $in: myFollows.following } },
      options
    );

    
    return res.status(200).send({
      status: "success",
      message: "Feed de publicaciones",
      page,
      itemsPerPage,
      user: req.user.id,
      myFollows: myFollows.following,
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "no se han listado las publicaciones del feed!!!!",
    });
  }
};

//Exportar acciones
module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  upload,
  user,
  media,
  feed,
};
