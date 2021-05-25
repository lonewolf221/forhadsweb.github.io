require('dotenv').config()
const express = require('express');
const app = express()
const ejs = require('ejs')
const expressLayouts =require('express-ejs-layouts')
const path = require('path');
const { static, urlencoded } = require('express');
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('express-flash')
const MongoDbStore = require('connect-mongo');
const { then } = require('laravel-mix');
const passport = require('passport')


//database connection (38:00)
const url  ='mongodb://localhost:27017/pizza';
const connection =mongoose.connection;

mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true});

connection.on('error', console.error.bind(console, 'connection error:'));
connection.once('open', function() {
  console.log('database connected...')
});



//session config
app.use(session({
  secret: process.env.COKIE_SECRET,
  store: MongoDbStore.create({
    client:connection.getClient()
  }),
  resave:false,
  saveUninitialized:false,
  cookie:{maxAge:1000*60*60*24} 
}))

//passport configuration
const passportinit= require('./app/config/passport')
passportinit(passport)
app.use(passport.initialize())
app.use(passport.session())

//Assets 
app.use(static(path.join(__dirname,'public')))
app.use(express.urlencoded({extended:false}))
app.use(flash())
app.use(express.json())

//global middleware
app.use((req,res,next)=>{
   res.locals.session = req.session
   res.locals.user = req.user
   next()
})

//template engine
app.use(expressLayouts)
app.set('views',path.join(__dirname,'/resources/views'))
app.set('view engine','ejs')

//routes
require('./routes/web')(app)

//server 
const PORT = process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`server started at port ${PORT}`)
})



