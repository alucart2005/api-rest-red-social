const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const PublicationSchema = mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  text: {
    type: String,
    require: true,
  },
  file: String,
  create_at: {
    type: Date,
    default: Date.now,
  },
});

PublicationSchema.plugin(mongoosePaginate)

module.exports =model("Publication", PublicationSchema, "Publications")
//modelo, schema, coleccion