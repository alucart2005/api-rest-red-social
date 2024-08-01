const express = require("express");
const router = express.Router();
const multer = require("multer");
const PublicationController = require("../controllers/publication");
const check = require("../middlewares/auth");

// Configuracion Subida
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./uploads/publications");
  },
  filename: (req, file, cb) => {
    cb(null, "pub-" + Date.now() + "-" + file.originalname);
  },
});

// Crear middleware de multer
const uploads = multer({ storage });

// Definir rutas
router.get("/prueba-publication", PublicationController.pruebaPublication);
router.post("/save", check.auth, PublicationController.save);
router.get("/detail/:id", check.auth, PublicationController.detail);
router.delete("/remove/:id", check.auth, PublicationController.remove);
router.get("/user/:id", check.auth, PublicationController.user);
router.post(
  "/upload/:id",
  [check.auth, uploads.single("file0")],
  PublicationController.upload
);
router.get("/media/:file",check.auth,PublicationController.media)
router.get("/feed/:page?", check.auth, PublicationController.feed);
router.get("/counters/:id?", check.auth, PublicationController.counters);



// exportar router
module.exports = router;
