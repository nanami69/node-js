var express = require('express');
var router = express.Router();
const db = require('../models/index');
const {Op} = require('sequelize');

/* GET users listing. */
router.get('/', function(req, res, next) {
  db.User.findAll().then(usrs => {
    var data = {
      title: 'Users/Index',
      content: usrs
    }
    res.render('users/index', data);
  })
});

router.get('/add', function(req, res, next) {
  var data = {
    title: 'Users/Add',
    form: new db.User(),
    err: null
  };
  res.render('users/add', data);
});

router.post('/add', function(req, res, next) {
  const form = {
    name: req.body.name,
    pass: req.body.pass,
    mail: req.body.mail,
    age: req.body.age,
  };
  db.sequelize.sync()
    .then(() => db.User.create(form)
    .then(usr => {
      res.redirect('/users');
    })
    .catch(err => {
      var data = {
        title: 'Users/Add',
        form: form,
        err: err
      }
      res.render('users/add', data);
    })
    )
});

router.get('/edit', function(req, res, next) {
  db.User.findByPk(req.query.id)
    .then(usr => {
      var data = {
        title: 'Users/Edit',
        form: usr
      };
      res.render('users/edit', data);
    });
});

router.post('/edit', function(req, res, next) {
  db.User.findByPk(req.body.id)
    .then(usr => {
      usr.name = req.body.name;
      usr.pass = req.body.pass;
      usr.mail = req.body.mail;
      usr.age =  req.body.age;
      usr.save().then(() => res.redirect('/users'));
    });
});

router.get('/delete', function(req, res, next) {
  db.User.findByPk(req.query.id)
    .then(usr => {
      var data = {
        title: 'Users/Delete',
        form: usr
      };
      res.render('users/delete', data);
    });
});

router.post('/delete', function(req, res, next) {
  db.User.findByPk(req.body.id)
    .then(usr => {
      usr.destroy().then(() => res.redirect('/users'));
    });
});

router.get('/login', function(req, res, next) {
  var data = {
    title: 'Users/Login',
    content: '名前とパスワードを入力してください。'
  };
  res.render('users/login', data);
});

router.post('/login', function(req, res, next) {
  db.User.findOne({
    where:{
      name:req.body.name,
      pass:req.body.pass
    }
  }).then(usr=>{
    if ( usr != null ) {
      req.session.login = usr;
      let back = req.session.back;
      if (back == null) {
        back = '/';
      }
      res.redirect(back);
    } else {
      var data = {
        title: 'User/Login',
        content: '名前かパスワードに問題があります。再度入力してください。'
      }
      res.render('users/login', data);
    }
  })
});

module.exports = router;
