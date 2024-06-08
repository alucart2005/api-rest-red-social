// acciones de prueba
const pruebaUser = (req, res) => {
  return res.status(200).send({
    message:"Mensaje enviado desde: controllers/user.js"
  })
};

// Registro de usuarios
const register = (req,res) =>{
  return res.status(200).json({
    message: "Accion de registro de usuario"
  })
}

//Exportar acciones
module.exports={
  pruebaUser,
  register
}
