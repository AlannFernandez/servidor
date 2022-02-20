const express = require('express');
const router = express.Router();
const passport = require('passport');
const { isLoggedIn } = require('../lib/auth');
const jwt = require('jsonwebtoken');
const pool = require('../database');
const helpers = require('../lib/helpers');

// registro
router.get('/signup', (req, res) => {
  res.send('ventana para registrarse');
});

router.post('/signup', async(req, res)=>{
  // console.log(req.body)  
  let msg="";
  let token="";
  const{idRole, email, password }=req.body;  
  let pass = password;
  let newUser = { 
      idRole,       
      email,                
      pass
  };
  const query = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (query.length > 0) {
     msg='este email ya esta en uso';
  } else {
    newUser.pass = await helpers.encryptPassword(pass);
    const result = await pool.query('INSERT INTO users SET ? ', newUser);
    newUser.id = result.insertId;    
    const id = newUser.id;
    let data = JSON.stringify(id);
    token = jwt.sign(data, 'token');    
    msg='usuario registrado exitosamente';
  }
  res.json({
    "msg":msg,
    "token":token
  })
})

// ingreso
router.get('/signin', (req, res) => {
  
  res.send('ventana para ingresar');
});

router.post('/signin', async (req,res) => {  
  let msg="";
  let token="";
  const { email, password } = req.body;
  
  const query = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
  if (query.length > 0) {

    const user = query[0];
    const validPassword = await helpers.matchPassword(password, user.pass)
    if (validPassword) {      
      const idUser = query[0].id;
      const idRole = query[0].idRole;
      const items = {idUser, idRole};
      let data = JSON.stringify(items);
      token = jwt.sign(data, 'stil');
      msg="acceso permitido"     ;
    } else {
      msg='Contraseña incorrecta';
    }

  } else {
    msg='Este email no está registrado'
  }  
res.json({
  "msg":msg,
  "token":token
})

});

// salir
router.get('/logout', (req, res) => {
  req.logOut();
  res.send('se cerro la sesion');
});

// rutas protegidas con token

router.get('/profile', verifyToken, async(req, res)=>{
  if(!req.data.idRole){
    res.send('was wrong')
  }else{
    res.send('all success you can continue')
  }
});

// verificar token
function verifyToken (req,res, next){
  if(!req.headers.authorization) return res.status(401).json('Acceso no autorizado');

  const token = req.headers.authorization.substr(7);
  if(token!==''){
    const content = jwt.verify(token,'stil');
    req.data = content;
    next();
  }else{
    res.status(401).json('Token vacio');
  }

}

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  const rows = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
  done(null, rows[0]);
});


module.exports = router;
