const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  content: {
    type: String,
    required: true
  },

  image: {
    type: String,
    default: ""
  },

  // simple like counter
  likes: {
    type: Number,
    default: 0
  },

  // ✅ Comments
  comments: [
    {
      user: {
        type: String,
        default: "Anonymous"
      },
      text: {
        type: String,
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ]

}, { timestamps: true });

module.exports = mongoose.model("Post", postSchema);