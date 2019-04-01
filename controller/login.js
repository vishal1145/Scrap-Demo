'use strict';

  //var todoList = require('../controllers/controller');
  var express = require('express');
  var router = express.Router();
  const mongoose = require('mongoose');
  var webdriver = require('selenium-webdriver');
  var { Builder, By, Key, until } = require('selenium-webdriver');
  const chrome = require('selenium-webdriver/chrome');
  var path = require('chromedriver').path;
  var service = new chrome.ServiceBuilder(path).build();
  chrome.setDefaultService(service)

  
  router.post('/login', function(req, res, next){
    login(req.body, res, next);
  })

  async function login(req, res, next) {

    // let addr = '212.56.139.253:80'
    // let opt = new chrome.Options().addArguments(`--proxy-server=http://${addr}`)
  
    console.log("Ready to login")
    let driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      //.setChromeOptions(opt)
      .build();
    try {
      //Login
      await driver.get('https://www.kijiji.ca/t-login.html');
      await driver.findElement(By.id("LoginEmailOrNickname")).sendKeys(req.email);
      await driver.findElement(By.id("login-password")).sendKeys(req.password);
      await driver.findElement(By.id('SignInButton')).click()
      console.log('login sucess')
  
      //Send Message
      await waittime(5000);
      await driver.get(req.url);
      await driver.findElement(By.id("message")).clear()
      await driver.findElement(By.id("message")).sendKeys(req.message);
      await driver.findElement(By.id("phoneNumber")).sendKeys(req.mobile);
      await driver.findElement(By.className('submitButton-2507489961')).click()
      await waittime(5000);
      console.log('success')
      res.send('success')
    }catch(e){
      next(e)
    }
    finally {
      await driver.quit();
      next('something went wrong')
    }
  }

  function waittime(time) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve(true);
      }, time)
    });
  }


  module.exports = router;
