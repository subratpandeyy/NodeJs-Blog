require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');


const connectDB = require('./server/config/db');
const session = require('express-session');
const { isActiveRoute } = require('./server/helpers/routehelpers');

const cors = require('cors');

const app = express();
const PORT = 5000 || process.env.PORT;  // set port for hosting

app.use(cors({
    origin: 'http://localhost:5173' // or '*' for all origins during dev
  }));

// connect to DB
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(methodOverride('_method'));

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI
    }),
}))

app.use(express.static('public'));

// Templating Engine
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

app.locals.isActiveRoute = isActiveRoute;

app.use('/', require('./server/routes/main'));      // connect to router
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => {
    console.log(`App listening on Port ${PORT}`);
});