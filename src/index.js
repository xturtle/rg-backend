//main components
import express from 'express';
import {Sequelize, Op} from 'sequelize'
import log4js from 'log4js';
import bcrypt from 'bcrypt';
import expressJWT from 'express-jwt';
import jwt from 'jsonwebtoken';
import fileUpload from 'express-fileupload';
import md5 from 'md5';

//database models
import {User, Post} from './models';

//config
import configSet from './config/config.json'
import instaPic from './instapic';
import { run } from 'jest';

const config = configSet[process.env.NODE_ENV], logger = log4js.getLogger();
var server = null;
logger.level = 'all';

var app = express(), sequelize = null;

// middleware setting
app.use(express.json());                                  // json parser
app.use(express.urlencoded({ extended: true }));          // urlencoded form parser
app.use(fileUpload());                                    // file upload middleware
app.use('/', express.static('./web'));                    // static content (frontend)
app.use('/images', express.static(config.app.imagePath)); // static image
app.use(expressJWT({                                      // jwt init
  secret: config.app.jwtSecret,                           // secret, read from config
  algorithms: ['HS256']                                   // algorithm used
}).unless({
  path: [                                                 // specified routes which need not to authenticate first.
    "/", "/login/", "/submit/", "/post/*", "/profile/*",
    "/api/signon", "/api/signup" 
  ]
}));
app.use(function (err, req, res, next) {                  //capturing 401 error  
  if (err.name === 'UnauthorizedError') res.send(instaPic.result(null, "101"))
});

app.options('*') // include before other routes
//get web service status
app.get('/healthy', (req, res) => {  
  res.send('Hello World! InstaPic Server is running.');
});

//get posts of all or specified users' posts
app.get("/api/posts/:peopleID?/:offset?/:size?", async (req, res) => {
  var recently    = req.query.recently == undefined? true : req.query.recently;
  var offset      = req.params.offset  == undefined? 0: req.params.offset
  var size        = req.params.size    == undefined? config.app.defaultSizeOfPage: req.params.size;
  var queryObject = {
    order : [['createdAt', (recently? 'DESC': 'ASC')]],
    offset: offset,
    limit: size
  };

  if (req.params.peopleID != "all" && req.params.peopleID != undefined)
    queryObject["where"] = { uid: req.params.peopleID }

  logger.info(`Querying all photos from people #${req.params.peopleID} (Recently=${recently}) from record #${offset} with page size ${size}...`);
  const posts = await Post.findAll(queryObject);

  res.send(instaPic.result(posts));
});

//get user profile
app.get("/api/user/:peopleID?", async (req, res) => {  
  let peopleID = req.params.peopleID;
  if (req.params.peopleID == undefined)
    peopleID = req.user.id;

  logger.info(`Querying people profile #${peopleID}...`);
  var user = await User.findByPk(peopleID, {attributes: { exclude: ['password'] }});
  res.send(instaPic.result(user));
});

//get a post
app.get("/api/post/:postID", async (req, res) => {  
  if (req.params.postID == undefined)
    return null

  logger.info(`Querying post #${req.params.postID}...`);
  const post = await Post.findByPk(req.params.postID);
  
  res.send(instaPic.result(post));
});

//send a post
app.post("/api/post", async (req, res)=>{  
  let image;
  let newPath;
  let newFileName;

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.send(instaPic.result("200"));
  }  

  image = req.files.image;
  newFileName = `${md5(image.data)}.${image.name.split(".").slice(-1)[0]}`
  newPath = `${config.app.imagePath}/${newFileName}`;

  // Use the mv() method to place the file somewhere on your server
  await image.mv(newPath);
  const toBePost = {
    uid: req.user.id,
    image: newFileName,
    text: req.body.text
  };
  console.log(toBePost);
  const newPost = await Post.create(toBePost);
  return res.send(instaPic.result(newPost.id));
});

//delete post
app.delete("/api/post", async (req, res)=>{

});

//sign on
app.post("/api/signon", async (req, res) => {
  logger.info(`User named "${req.body.username}" attempting to login...`);  
  
  const user = await User.findOne({
    where: { 
      username: req.body.username
    },
    raw: true
  });
  var success = false;

  if (user !== null) {
    if (bcrypt.compareSync(req.body.password, user.password)) {
      logger.info(`"${req.body.username}" login successful, generating token...`);
      //generate JWT token
      const token = 'Bearer ' + jwt.sign({
        id: user.id,
        username: user.username
        }, config.app.jwtSecret, { expiresIn: config.app.jwtExpiresIn }
      )
      logger.info(`token generated, will expired after ${config.app.jwtExpiresIn}.`);
      success = true
      res.send(instaPic.result(token));      
    }
  }
  if (!success) {
    logger.info(`"${req.body.username}" login failed.`);
    res.send(instaPic.result(null, "100"));
  }  
});

//sign up
app.post("/api/signup", async (req, res) => {
  logger.info(`new user acquired, validating...`);
  //check password
  //other user registration logic put in here...
  if (req.body.password.length < 6) {
    logger.info(`password is too short, rejected.`);
    res.send(instaPic.result(null, "110"));
    return
  }

  // begin transaction
  logger.info(`begin transaction.`);
  let transaction = await sequelize.transaction();
  try {
    const [result, created] = await User.findOrCreate({
      where: {
        username: req.body.username
      },
      defaults: {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, config.app.saltRounds)
      },
      transaction: transaction
    });
  
    // commit    
    await transaction.commit();
    if (created){
      logger.info(`welcome the new user "${req.body.username}" to join us.`);
      res.send(instaPic.result());
    } else {
      logger.info(`username already used, reject.`);
      res.send(instaPic.result(null, "111"));
    }
  } catch (err) {
    // Rollback transaction only if the transaction object is defined
    logger.error(`transaction failed: ${err.message}`);
    if (transaction) await transaction.rollback();
  }
});

// another static content
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname+'/web/index.html'));
});

function init() {
  logger.info('InstaPic Server starting...');
  logger.info(`Loading configuration set "${process.env.NODE_ENV}".`)
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: config.storage,
    logging: process.env.NODE_ENV !== 'test'?logger.debug.bind(logger): null
  });
  logger.info(`Using SQLite database from ${config.storage}.`);

  if (process.env.NODE_ENV !== 'test') {
    return app.listen(config.app.port, () => {    
      logger.info(`InstaPic Server listening on port ${config.app.port}.`);
    });
  }
}

export default app;
init();