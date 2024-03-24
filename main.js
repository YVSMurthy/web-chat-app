const http = require('http');
const { Server } = require('socket.io')
const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const {userData, contactData, chatData} = require("./database/users")

const app = express();
const server = http.createServer(app);
const io = new Server(server)

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())
app.set('view engine', 'ejs');
app.use(express.static('./public'));

const sessionMiddleware = session({
  resave: false,
  saveUninitialized: false,
  secret: 'abcd',
})
app.use(sessionMiddleware)
io.engine.use(sessionMiddleware);

app.get('/', (req, res) => {
  res.render('landingPage');
});

app.get('/login', (req, res) => {
  // if (req.session.phone) {
  //   res.redirect('/chat');
  // } else {
  //   res.render('login');
  // }
  res.render('login')
});

app.get('/signup', (req, res) => {
  res.render('signup');
});

app.post('/loginUser', async (req, res) => {
  var { phone, password } = req.body;
  try {
    phone = Number(phone);
    const user = await userData.findOne({
      phone: phone,
      password: password,
    });

    if (user) {
      req.session.phone = phone;
      req.session.username = user.firstName;
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 2);
      req.session.cookie.expires = expirationDate;
      res.redirect('/chat');
    } else {
      res.redirect('/login?error=wrong username or password');
    }
  } catch (error) {
    console.error('Error occurred:', error);
    res.status(500).send(error);
  }
});

app.post('/signupUser', async (req, res) => {
  var {
    firstName,
    lastName,
    dob,
    phone,
    email,
    password,
    confirmPassword,
  } = req.body;

  const nameReg = /[a-zA-Z]{3,}/;
  const phoneReg = /[1-9][0-9]{9}/;
  const emailReg =
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
  const passwordReg =
    /(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}/;

  if (!nameReg.test(firstName)) {
    res.redirect('/signup?error=first name not in correct format');
  } else if (!nameReg.test(lastName)) {
    res.redirect('/signup?error=last name not in correct format');
  } else if (!phoneReg.test(phone)) {
    res.redirect('/signup?error=phone no. not in correct format');
  } else if (!emailReg.test(email)) {
    res.redirect('/signup?error=email not in correct format');
  } else if (!passwordReg.test(password)) {
    res.redirect(
      "/signup?error=password should have atleast 1 upper and lower case, numbers, symbols, with min length 8"
    );
  } else if (password !== confirmPassword) {
    res.redirect("/signup?error=passwords don't match");
  } else {
    try {
      const prevUser = await userData.findOne({
        phone: phone,
      });

      if (prevUser) {
        res.redirect(
          "/signup?error=phone no. already used by another user"
        );
      } else {
        await userData.create({
          firstName: firstName,
          lastName: lastName,
          phone: phone,
          dob: dob,
          email: email,
          password: password,
        });

        await contactData.create({
          username: firstName,
          phone: phone,
          contacts: []
        })

        res.redirect('/login');
      }
    } catch (error) {
      res.send(error);
    }
  }
});

app.get('/chat', (req, res) => {
    // if (req.session.user) {
    //     res.render("chatApp")
    // }
    // else {
    //     res.redirect("login")
    // }
    res.render("chatApp")
})

app.get('/createContact', async (req, res) => {
  await contactData.create({
    username: "Suyash",
    phone: 8827954540,
    contacts: [
      {
        contactName: "Aabhas",
        phone: 9829146140
      }, 
      {
        contactName: "Aryajeet",
        phone: 7905690107
      }
    ]
  })

  await contactData.create({
    username: "Aryajeet",
    phone: 7905690107,
    contacts: [
      {
        contactName: "Aabhas",
        phone: 9829146140
      }, 
      {
        contactName: "Suyash",
        phone: 8827954540
      }
    ]
  })

  await contactData.create({
    username: "Aabhas",
    phone: 9829146140,
    contacts: [
      {
        contactName: "Suyash",
        phone: 8827954540
      }, 
      {
        contactName: "Aryajeet",
        phone: 7905690107
      }
    ]
  })

  res.send("Created contacts")
})

app.get('/users', async (req, res) => {
  const users = await userData.find()
  res.send(users)
})

app.get('/contacts', async (req, res) => {
  const contacts = await contactData.find()
  res.send(contacts)
})

app.get('/allmessages', async (req, res) => {
  const messages = await chatData.find()
  res.send(messages)
})

app.get('/deleteUsers', async (req, res) => {
  await userData.deleteMany()
  res.send("Deleted users")
})

app.get('/deleteContacts', async (req, res) => {
  await contactData.deleteMany()
  res.send("Deleted contacts")
})

app.get('/deleteMessages', async (req, res) => {
  await chatData.deleteMany()
  res.send("Deleted messages")
})

userSockets = {}
io.on('connection', async (socket) => {
  const username = socket.request.session.username;
  const phone = socket.request.session.phone
  userSockets[phone] = {id: socket.id, connected: true};
  const contacts = await contactData.findOne({
    username: username,
    phone: phone
  })

  io.to(socket.id).emit('userLoggedIn', contacts);

  socket.on('load messages', async (receiverList) => {
    const receiver = receiverList[0]
    const user_unread = await contactData.findOne({phone: phone})
    const index = user_unread.contacts.findIndex(elem => elem.phone == receiver)
    if (index != -1) {
      user_unread.contacts[index].unread = 0
    }
    await user_unread.save()

    receiverList.push(phone)
    receiverList.sort()

    const currChat = await chatData.findOne({
      participants: receiverList
    }) 
    io.to(socket.id).emit('load messages', (currChat)?currChat.chats:[])
  })

  socket.on('new message', async (message, receiverList) => {
      const receiver = receiverList[0]
      receiverList.push(phone)
      receiverList.sort()
      let receivers = []
      receiverList.forEach(element => {
        receivers.push(userSockets[element].id)
      });
      const chat = await chatData.findOne({
        participants: receiverList
      })

      currMessage = {
        sender: username,
        message: message,
        timestamp: new Date()
      }

      if (chat) {
        prevMessages = chat.chats
        prevMessages.push(currMessage)
        await chatData.findOneAndUpdate({participants: receiverList}, {
          chats: prevMessages
        })
      }
      else {
        await chatData.create({
          participants: receiverList,
          chats: [currMessage]
        })
      }
      const user_contact = await contactData.findOne({phone: receiver})
        const index = user_contact.contacts.findIndex(elem => elem.phone == phone)
        console.log(index)
        if (index == -1) {
          user_contact.contacts.push({
            contactName: username,
            phone: phone,
            unread: 0
          })

          const person = await contactData.findOne({phone: phone})
          person.contacts.push({
            contactName: user_contact.username,
            phone: receiver,
            unread: 0
          })
          await user_contact.save()
          await person.save()

          // updating receivers contact
          if (userSockets[receiver].connected == true) {
            const receiver_contacts = await contactData.findOne({phone: receiver})
            io.to(userSockets[receiver].id).emit('userLoggedIn', receiver_contacts);
          }

          // updating the chats
          sender_contacts = await contactData.findOne({phone: phone})
          io.to(socket.id).emit('userLoggedIn', sender_contacts);
        }
        
        if (userSockets[receiver].connected == false) {
          const user_contact = await contactData.findOne({phone: receiver})
          const index = user_contact.contacts.findIndex(elem => elem.phone == phone)
          console.log(index)
          user_contact.contacts[index].unread += 1
          await user_contact.save()
          io.to(socket.id).emit('new message', { username: username, message: message, participants: receiverList});
        }
        else {
          io.to(receivers).emit('new message', { username: username, message: message, participants: receiverList});
        }
  });

  socket.on('inc unread message', async (receiver) => {
    const user_unread = await contactData.findOne({phone: phone})
    const index = user_unread.contacts.findIndex(elem => elem.phone == receiver)
    user_unread.contacts[index].unread += 1
    await user_unread.save()
  })
  
  socket.on('find user', async (user) => {
      const users = await userData.find({firstName: user})
      const matchedContacts = users.filter(elem => elem.firstName != username)
      io.to(socket.id).emit('user matches', matchedContacts)
  })

  socket.on('disconnect', () => {
    userSockets[phone].connected = false
    console.log(userSockets)
  })
});


server.listen(3000);