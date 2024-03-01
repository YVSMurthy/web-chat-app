const mongoose =  require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/pingpal")

const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    email: String,
    dob: String,
    password: String
})

module.exports = mongoose.model("users", userSchema);