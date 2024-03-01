const session = require("express-session")
const bodyParser = require('body-parser')
const userData = require("./users.js")
const express = require('express')
const app = express()

app.use(bodyParser.urlencoded({ extended: true }))
app.set("view engine", "ejs")
app.use(express.static('./public'))

app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: "abcd"
}))

app.get('/', (req, res) => {
    res.render("landingPage")
})

app.get('/login', (req, res) => {
    if (req.session.user) {
        res.redirect("/chat")
    }
    else {
        res.render("login")
    }
})

app.get('/signup', (req, res) => {
    res.render("signup")
})

app.post('/loginUser', async (req, res) => {
    var { phone, password } = req.body
    try {
        phone = Number(phone)
        const user = await userData.findOne({
            phone: phone,
            password: password
        });

        if (user) {
            req.session.user = phone;
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() + 2);
            req.session.cookie.expires = expirationDate;
            res.redirect("/chat");
        } else {
            res.redirect("/login?error=wrong username or password");
        }
    } 
    catch (error) {
        console.error("Error occurred:", error);
        res.status(500).send(error);
    }
})

app.post('/signupUser', async (req, res) => {
    var {firstName, lastName, dob, phone, email, password, confirmPassword} = req.body

    const nameReg = /[a-zA-Z]{3,}/
    const phoneReg = /[1-9][0-9]{9}/
    const emailReg = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
    const passwordReg = /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;

    if (!nameReg.test(firstName)) {
        res.redirect("/signup?error=first name not in correct format");
    }
    else if (!nameReg.test(lastName)) {
        res.redirect("/signup?error=last name not in correct format");
    }
    else if (!phoneReg.test(phone)) {
        res.redirect("/signup?error=phone no. not in correct format");
    }
    else if (!emailReg.test(email)) {
        res.redirect("/signup?error=email not in correct format");
    }
    else if (!passwordReg.test(password)) {
        res.redirect("/signup?error=password should have atleast 1 upper and lower case, numbers, symbols, with min length 8");
    }
    else if (password !== confirmPassword) {
        res.redirect("/signup?error=passwords don't match")
    }
    else {
        try {
            const user = await userData.create({
                firstName: firstName,
                lastName: lastName,
                phone: phone,
                dob: dob,
                email: email,
                password: password
            })

            res.redirect('/login')
        }
        catch(error) {
            res.send(error)
        }
    }

    
})

app.get('/chat', (req, res) => {
    if (req.session.user) {
        res.render("chatApp")
    }
    else {
        res.redirect("login")
    }
})

// app.get('/create', async (req, res) => {
//     const user = await userData.create({
//         firstName: "Suyash",
//         lastName: "Murthy",
//         phone: "8827954540",
//         dob: "2004-06-02",
//         email: "suyash.murthy@gmail.com",
//         password: "abcd1234"
//     })
//     res.send(user)
// })

app.get('/delete', async (req, res) => {
    const user = await userData.findOneAndDelete({
        phone: "7905690107"
    })
    res.send(user)
})

app.get('/users', async (req, res) => {
    const user = await userData.find()
    res.send(user)
})

app.listen(3000)