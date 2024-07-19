const Publication = require("../models/publication");

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
    };

    const publications = await Publication.paginate(
      { user: userId },
      options
    );

    return res.status(200).send({
      status: "success",
      message: "Every thibg is OK !!!",
      publications,
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Error al obtener lista de publicación",
    });
  }
};

// Listar todas las publicaciones

// Subir ficheros
// Devolver archivos multimedia

//Exportar acciones
module.exports = {
  pruebaPublication,
  save,
  detail,
  remove,
  user,
};
