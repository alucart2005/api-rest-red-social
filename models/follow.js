const { Schema, model } = require("mongoose");
const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');


const FollowSchema =mongoose.Schema({
  user: {
    type: Schema.ObjectId,
    ref: "User",
  },
  followed: {
    type: Schema.ObjectId,
    ref: "User",
  },
  create_at: {
    type: Date,
    default: Date.now,
  },
});

FollowSchema.plugin(mongoosePaginate);

module.exports=model("Follow", FollowSchema, "follows")
