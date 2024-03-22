const mongoose =  require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/pingpal")

// user data
const userSchema = mongoose.Schema({
    firstName: String,
    lastName: String,
    phone: Number,
    email: String,
    dob: String,
    password: String
})

// contact data
const contactSchema = mongoose.Schema({
    username: String,
    phone: Number,
    contacts: [{
        contactName: String,
        phone: Number,
        unread: {type: Number, default: 0}
    }]
})

// chat data
const chatSchema = mongoose.Schema({
    participants: [String],
    chats: [{
        sender: String,
        message: String,
        timestamp: String
    }]
})

module.exports = {
    userData: mongoose.model("users", userSchema),
    contactData: mongoose.model("contacts", contactSchema),
    chatData: mongoose.model("chats", chatSchema)
}