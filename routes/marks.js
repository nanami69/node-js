var express = require('express');
var router = express.Router();
const db = require('../models/index');
const {Op} = require('sequelize');
const MarkdownIt = require('markdown-it');
const markdown = new MarkdownIt();

const pnum = 10;

function check(req, res) {
    if (req.session.login == null) {
        req.session.back = '/md';
        res.redirect('/users/login');
        return true;
    } else {
        return false;
    }
};

router.get('/',(req,res,next) => {
    if (check(req,res)) {
        return;
    }
    db.Markdata.findAll({
        where:{userId: req.session.login.id},
        limit:pnum,
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(mds => {
        var data = {
            title: 'Markdown Search',
            login: req.session.login,
            message: '※最近の投稿データ',
            form: {find:''},
            content:mds
        };
        res.render('md/index', data);
    });
});

router.post('/', function(req, res, next) {
    if (check(req,res)) {
        return;
    }
    db.Markdata.findAll({
        where:{
            userId: req.session.login.id,
            content: {[Op.like]:'%'+req.body.find+'%'}
        },
        order: [
            ['createdAt', 'DESC']
        ]
    }).then(mds => {
        var data = {
            title: 'Markdown Search',
            login: req.session.login,
            message: '※"'+req.body.find + '"で検索された最近の投稿データ',
            form: req.body,
            content:mds
        };
        res.render('md/index', data);
    });
  });

  router.get('/add',(req,res,next) => {
    if (check(req,res)) {
        return;
    }
    res.render('md/add', {title: 'Markdown/Add'});
  });

  router.post('/add',(req,res,next) => {
    if (check(req,res)) {
        return;
    }
    db.sequelize.sync()
    .then(() => db.Markdata.create({
        userId: req.session.login.id,
        title: req.body.title,
        content: req.body.content
    })
    .then(model => {
        res.redirect('/md');
    })
    );
  });

  router.get('/mark',(req,res,next) => {
    res.redirect('md');
    return;
  });

  router.get('/mark/:id',(req,res,next) => {
    if (check(req,res)) {
        return;
    }
    db.Markdata.findOne({
        where: {
            id:req.params.id,
            userId:req.session.login.id
        }
    })
    .then((model) => {
        makepage(req, res, model, true);
    });
  });

  router.post('/mark/:id',(req,res,next) => {
    if (check(req,res)) {
        return;
    }
    db.Markdata.findByPk(req.params.id)
        .then(md => {
            md.content = req.body.source;
            md.save().then((model) => {
                makepage(req, res, model, false);
            });
        })
  });

  function makepage(req, res, model, flg) {
      var footer;
      if (flg) {
          var d1 = new Date(model.createdAt);
          var dstr1 = d1.getFullYear() + '-' + (d1.getMonth() + 1) + '-'+ d1.getDate();
          var d2 = new Date(model.updatedAt);
          var dstr2 = d2.getFullYear() + '-' + (d2.getMonth() + 1) + '-'+ d2.getDate();
          footer = '(created: ' + dstr1 + ', updated: ' + dstr2 + ')';
      } else {
          footer = '(Updatiing date and time infomation...)';
      }
      var data = {
        title: 'Markdown',
        id: req.params.id,
        head: model.title,
        footer: footer,
        content:markdown.render(model.content),
        source:model.content
    };
    res.render('md/mark', data);
  }

  module.exports = router;