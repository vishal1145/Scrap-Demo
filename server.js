var express = require('express'),
  cors = require('cors'),
  app = express(),
  port = 9105; //process.env.PORT || 3000;
var bodyParser = require('body-parser');

const mongoose = require('mongoose');
var webdriver = require('selenium-webdriver');
var { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
var path = require('chromedriver').path;
var lib = process.cwd()
var Scrap = require(lib + '/api/models/scrap')
var route = require('./api/routes/routes')
var CronJob = require('cron').CronJob;


//mongoose.connect('mongodb://157.230.57.197:27017/scarpingdemo');
mongoose.connect('mongodb://localhost:27017/scarpingdemo');
const Schema = mongoose.Schema;

var service = new chrome.ServiceBuilder(path).build();
chrome.setDefaultService(service);

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use('/api', route)
console.log('todo list RESTful API server started on: ' + port);


setTimeout(function () {
  // scrapData();
  //login();
//mainProcess ();
}, 1000)

app.listen(port);
app.get('/getData', async function (req, res) {

  let pagdata = await Scrap.find({})

  let recpage = Number(req.query.page) || 1;
  let limit = Number(req.query.limit) || 10

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

app.post('/login', function (req, res) {
  login(req.body);
})


new CronJob('0 0 */1 * * *', function () {
  console.log(new Date());
  //scrapData();
}, null, true, 'America/Los_Angeles');


async function scrapData() {
  console.log("Ready to Scarp")
  let temp = []
  let driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
  try {
    await driver.get('https://www.kijiji.ca/b-cars-trucks/british-columbia/new__used/c174l9007a49?for-sale-by=ownr');
    var elements = await driver.findElements(By.className('clearfix'))
    let images = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='image']/img"))
    let addids = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='left-col']/div[@class='watch watchlist-star p-vap-lnk-actn-addwtch']"))
    let prices = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='price']"));
    let titles = await driver.findElements(By.xpath("//div[@class='clearfix']/div[@class='info']/div[@class='info-container']/div[@class='title']"))

    for (let i = 0; i < addids.length; i++) {
      let price = '', title = '', addid = '';

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

    for (let l = 2; l <= 10; l++) {
      await driver.get('https://www.kijiji.ca/b-cars-trucks/british-columbia/new__used/page-' + l + '/c174l9007a49?for-sale-by=ownr');
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
      await driver.get('https://www.kijiji.ca/v-cars-trucks/edmonton/' + temp[i].title + '/' + temp[i].addid);
      let key = await driver.findElements(By.className('attributeLabel-240934283'))
      let numval = await driver.findElements(By.className('attributeValue-2574930263'))

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
      try {
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

    // console.log(temp.length)
    // //let tosave =  await Scrap.insertMany(temp)
    // for (let k = 0; k < temp.length; k++) {
    //   let tosave = await Scrap.update({ addid: temp[k].addid }, { $set: temp[k] }, { upsert: true, new: true })
    // }
  } finally {
    await driver.quit();
  }


};

function waittime(time) {
  return new Promise((resolve, reject) => {
    setTimeout(function () {
      resolve(true);
    }, time)
  });
}

async function login(req, res) {

  let addr = '212.56.139.253:80'
  let opt = new chrome.Options().addArguments(`--proxy-server=http://${addr}`)

  console.log("Ready to login")
  let driver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .setChromeOptions(opt)
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
  }
  finally {
    await driver.quit();
    return
  }
}

async function mainProcess (){
  var AntiCaptcha  = require('anticaptcha')
const AntiCaptchaAPI = new AntiCaptcha.AntiCaptcha("6Lcqv24UAAAAAIvkElDvwPxD0R8scDnMpizaBcHQ");
  var response1 = await AntiCaptchaAPI.isBalanceGreaterThan(10)
  if (await !AntiCaptchaAPI.isBalanceGreaterThan(10)) {
      console.warn("Take care, you're running low on money !")
  }

  const taskId = await AntiCaptchaAPI.createTask(
      "https://www.kijiji.ca", // The page where the captcha is
      "03AOLTBLTTyt0ZMKKsTrkPxhQKZAXEb8LJVt_ze25dO6i3HZzC0PS1VSt6d-UwYw0I2Ozle4s6PTD1uhoZ2ibJQRvSs_4KQ2mYwdkeQLlf7K-XCOyuEWA3do8kyIWroSRKKY-4qk31f31tQ60oResvV7xFi0CTu67ixBXt4cEZc9gAEeFUVm2x_ZU816xg1YnMNHlUUVopgA_h-g51arTOfQOUCXmswqKCyHMUE6B61KL3prirI6_XBnA8m7QAlcMILHWLfIRYYgNgh8jYaUkj2EoqQP9GBkxtW39TKZguJN2KSuLOjnNRpQJXxO_5N3RInLA-wPs4PLX1xBO4v8987XvqtXt8bJuCF22wE_RYmO_JHXoj_9Sh0EC7-ROU7g9JVLC9tpgAXneNjS3sytIFv--Ji6JfHpoTOodLBJX9s34UkB2Nq6yimW7CMGPptUmeI5xRlZ0wGF_ArvEyWsIP3w1DI3iHBo2iFA", // The data-site-key value
  )
  const response = await AntiCaptchaAPI.getTaskResult(taskId);
}


