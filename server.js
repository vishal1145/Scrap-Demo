var express = require('express'),
  cors = require('cors'),
  app = express(),
  port = 9105; //process.env.PORT || 3000;
var bodyParser = require('body-parser');

const mongoose = require('mongoose');
var route = require('./api/routes/routes')
var controller = require('./controller/data')
var user = require('./controller/login')
var CronJob = require('cron').CronJob;

var mongo_url = "mongodb+srv://moros:carscrapdemo@cluster0-t0bwd.mongodb.net/test?retryWrites=true";
//mongoose.connect('mongodb://157.230.57.197:27017/scarpingdemo');
mongoose.connect(mongo_url, function(err, res){
  // console.log(res);
  console.log(err);
});

const Schema = mongoose.Schema;

app.use(express.static(__dirname + '/public'));
app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use('/api', controller)
app.use('/user', user)
console.log('todo list RESTful API server started on: ' + port);

app.listen(port);

new CronJob('0 0 */1 * * *', function () {
  console.log(new Date());
  //scrapData();
}, null, true, 'America/Los_Angeles');


app.get('/get-ui', function (req, res) {
  res.sendfile(process.cwd() + '/data-feed.html');
});

//All Link to Scrap
//https://www.kijiji.ca/b-cars-trucks/edmonton-area/new__used/c174l1700202a49?for-sale-by=ownr
//https://www.kijiji.ca/b-cars-trucks/calgary/car/k0c174l1700199?for-sale-by=ownr

async function mainProcess (){
  var AntiCaptcha  = require('anticaptcha')
  const AntiCaptchaAPI = new AntiCaptcha.AntiCaptcha("3cc38fb69bce7f2a885fb4d579930f95");
  var response1 = await AntiCaptchaAPI.isBalanceGreaterThan(10)
  if (await !AntiCaptchaAPI.isBalanceGreaterThan(10)) {
      console.warn("Take care, you're running low on money !")
  }

  const taskId = await AntiCaptchaAPI.createTask(
      "https://www.kijiji.ca/", // The page where the captcha is
      "6LeqLCwUAAAAADHwg3Gj-DTciS00CC1MiHhn3wNT", // The data-site-key value
  )
  const response = await AntiCaptchaAPI.getTaskResult(taskId);
  console.log(response)
}

//mainProcess();


