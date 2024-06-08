// importar dependencias
const connection = require("./database/connection");
const express = require("express");
const cors = require("cors");

// mensaje de bienvenida
console.log("** SOCIAL NETWORK API NODE - UP AND RUNNING **");

// conexion a bbdd
connection();

// crear servidor node
const app = express();
const puerto = 3900;

// configurar cors (para el uso de middleware)
app.use(cors());

// convertir datos del body a js
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// cargar conf rutas
const UserRoutes = require("./routes/user");
const PublicationRoutes = require("./routes/publication");
const FollowRoutes = require("./routes/follow")

app.use("/api/user", UserRoutes);
app.use("/api/publication", PublicationRoutes);
app.use("/api/follow", FollowRoutes)

//ruta  de prueba
app.get("/ruta-prueba", (req, res) => {
  return res.status(200).json({
    id: 1,
    nombre: "Napoleon",
    web: "codewizardai.com",
  });
});

// poner servidor a escuchar http
app.listen(puerto, () => {
  console.log("Node.js server running on port: ", puerto);
});
