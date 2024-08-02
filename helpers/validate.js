const validator = require("validator");

const validate = (params) => {
  let name =
    !validator.isEmpty(params.name) &&
    validator.isLength(params.name, { min: 2, max: 30 }) &&
    validator.isAlpha(params.name, "es-ES");

  let surname =
    !validator.isEmpty(params.surname) &&
    validator.isLength(params.surname, { min: 2, max: 30 }) &&
    validator.isAlpha(params.surname, "es-ES");

  let nick =
    !validator.isEmpty(params.nick) &&
    validator.isLength(params.nick, { min: 2, max: 30 });

  let email =
    !validator.isEmpty(params.email) && validator.isEmail(params.email);

  let password = !validator.isEmpty(params.password)&&
  validator.isLength(params.password, { min: 8, max: 30 });

  let bio = validator.isLength(params.bio, { min: 2, max: 255 });
  console.log(name, surname, nick, email,password,bio)

  if (!name || !surname || !nick || !email || !password || !bio) {
    throw new Error("No se ha superado la validacion");
  }
};

module.exports = validate;
