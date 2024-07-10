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

    return res.status(200).send({
      status: "success",
      message: "Mostrar publicacion",
      publication: publicationStored,
    });
    
  } catch (error) {
    return res.status(404).json({
      status: "error",
      message: "No existe la publicacion",
    });
  }
};

// Eliminar publicaciones
// Listar todas las publicaciones
// Listar publicaciones de un usuario
// Subir ficheros
// Devolver archivos multimedia

//Exportar acciones
module.exports = {
  pruebaPublication,
  save,
  detail,
};
