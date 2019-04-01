'use strict';

  //var todoList = require('../controllers/controller');
  var express = require('express');
  var router = express.Router();
  const mongoose = require('mongoose');

  
  router.get('/getData', function(req, res){
    return 'test'
  })


  module.exports = router;
