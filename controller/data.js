'use strict';

  //var todoList = require('../controllers/controller');
  var express = require('express');
  var router = express.Router();
  const mongoose = require('mongoose');
  var lib = process.cwd()
  var Scrap = require(lib + '/api/models/scrap')
  var webdriver = require('selenium-webdriver');
  var { Builder, By, Key, until } = require('selenium-webdriver');
  const chrome = require('selenium-webdriver/chrome');
  var path = require('chromedriver').path;
  var service = new chrome.ServiceBuilder(path).build();
  chrome.setDefaultService(service)

  
  router.get('/getAllData', async function(req, res){
    let pagdata = await Scrap.find({})

    let recpage = Number(req.query.page) || 1;
    let limit = Number(req.query.limit) || pagdata.length
  
    function Paginator(items) {
  
      var page = recpage,
        per_page = limit,
        offset = (page - 1) * per_page,
  
        paginatedItems = items.slice(offset).slice(0, per_page),
        total_pages = Math.ceil(items.length / per_page);
      return {
        page: page,
        limit: per_page,
        total: items.length,
        pages: total_pages,
        docs: paginatedItems
      };
    }
    if (pagdata.length > 0) {
      let data = Paginator(pagdata)
  
      res.status(200).send({
        data: data.docs,
        total: data.total,
        limit: data.limit,
        page: data.page,
        pages: data.pages
      })
    } else {
      res.status(404).send("Oh uh, something went wrong");
    }
  })

  router.post('/scrapData', async function(req, res, next){
    scrapData(req.body, res, next)
  })

  function waittime(time) {
    return new Promise((resolve, reject) => {
      setTimeout(function () {
        resolve(true);
      }, time)
    });
  }

  async function scrapData(url, res, next) {
    console.log("Ready to Scarp")
    let temp = []
    let driver = new webdriver.Builder()
      .withCapabilities(webdriver.Capabilities.chrome())
      .build();
    try {

      //Login
      await driver.get('https://www.kijiji.ca/t-login.html');
      await driver.findElement(By.id("LoginEmailOrNickname")).sendKeys('vikash.gaurav@ithours.com');
      await driver.findElement(By.id("login-password")).sendKeys('Vikash@721');
      await driver.findElement(By.id('SignInButton')).click()
      console.log('login sucess')
      await waittime(5000);
      
      await driver.get(url.url);
      var elements = await driver.findElements(By.className('clearfix'))
      let images = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='image']/img"))
      let addids = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='watch watchlist-star p-vap-lnk-actn-addwtch']"))
      let prices = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='price']"));
      let titles = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='title']"))
  
      for (let i = 0; i < addids.length; i++) {
        let price = '', title = '', addid = '', image = '';
  
          image = [await images[i].getAttribute('src')],
          price = await prices[i].getText(),
          title = await titles[i].getText(),
          addid = await addids[i].getAttribute('data-adid')
        let obj = {
          image: image,
          price: price,
          title: title,
          addid: addid,
          created_at: new Date()
        }
        temp.push(obj)
      }
      console.log(temp.length)

      //Scrap data from page 2 to 10
      var str = url.url
      var fUrl = str.split("/");
      for (let l = 2; l <= 10; l++) {
        let url2 = fUrl[0] +'//'+ fUrl[1] +'/'+ fUrl[2] +'/'+ fUrl[3] +'/'+ fUrl[4] +'/'+ fUrl[5] + '/page-' + l +'/'+ fUrl[6] 
        await driver.get(url2);
        var elements = await driver.findElements(By.className('clearfix'))
        let images1 = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='image']/img"))
        let addids1 = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='watch watchlist-star p-vap-lnk-actn-addwtch']"))
        let prices1 = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='price']"));
        let titles1 = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='title']"))
  
        for (let i = 0; i < addids1.length; i++) {
          let image = '', price = '', title = '', addid = '';
  
          image = [await images1[i].getAttribute('src')],
            price = await prices1[i].getText(),
            title = await titles1[i].getText(),
            addid = await addids1[i].getAttribute('data-adid')
          let obj = {
            image: image,
            price: price,
            title: title,
            addid: addid
          }
          temp.push(obj)
        }
      }
  
      console.log(temp.length)
  
      for (let i = 0; i < temp.length; i++) {
        let image = []
        let link = 'https://www.kijiji.ca/v-cars-trucks/edmonton/' + temp[i].title + '/' + temp[i].addid;
        await driver.get(link);
        let key = await driver.findElements(By.className('attributeLabel-240934283'))
        let numval = await driver.findElements(By.className('attributeValue-2574930263'))
        try{
        var loc = await driver.findElement(By.className('address-3617944557'))
        let location = await loc.getText();
        temp[i].location = location
        }catch(e){  
          console.log(e)
          }
        try{
        var desc = await driver.findElement(By.xpath("//div[@class='descriptionContainer-3544745383']/div/p"))
        let description = await desc.getText()
        temp[i].description = description
        }catch(e){
          console.log(e)
        }
        
        for (let j = 0; j < key.length; j++) {
          var objKey = '', objVal = '';
          objKey = await key[j].getText();
          objVal = await numval[j].getText();
          
  
          if (objKey == 'Body Type') {
            temp[i].body_type = objVal
          }
          if (objKey == 'Colour') {
            temp[i].colour = objVal
          }
          if (objKey == 'Condition') {
            temp[i].condition = objVal
          }
          if (objKey == 'Drivetrain') {
            temp[i].drivetrain = objVal
          }
          if (objKey == 'Fuel Type') {
            temp[i].fuel_type = objVal
          }
          if (objKey == 'Kilometers') {
            temp[i].kilometers = objVal
          }
          if (objKey == 'Make') {
            temp[i].make = objVal
          }
          if (objKey == 'Model') {
            temp[i].model = objVal
          }
          if (objKey == 'No. of Doors') {
            temp[i].no_of_doors = objVal
          }
          if (objKey == 'No. of Seats') {
            temp[i].no_of_Seats = objVal
          }
          if (objKey == 'Transmission') {
            temp[i].transmission = objVal
          }
          if (objKey == 'Trim') {
            temp[i].trim = objVal
          }
          if (objKey == 'Year') {
            temp[i].year = objVal
          }
        }

        temp[i].link = link

        try {
          try {
            await driver.findElement(By.className('revealCopy-3312312496')).click()
            await waittime(1000);
            let contact = await driver.findElement(By.className('phoneShowNumberButton-1052915314')).getText()
            temp[i].contact_no = contact
          } catch (e) {
            console.log(e)
          }

          await driver.findElement(By.className('generalOverlay-3991437088')).click()
          let allImg = await driver.findElements(By.xpath("//li[@class='slide-886422699']/div[@class='mediaUnit-4218443897']/img"))
          for (let m = 0; m < allImg.length; m++) {
            let img = await allImg[m].getAttribute('src')
            image.push(img)
          }
          temp[i].image = image
          let tosave = await Scrap.update({ addid: temp[i].addid }, { $set: temp[i] }, { upsert: true, new: true })
        } catch (e) {
          console.log(e, temp[i])
          continue;
        }
      }
    } finally {
      await driver.quit();
      next('something went wrong')
    }
  };


  module.exports = router;
