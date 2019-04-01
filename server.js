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

//mongoose.connect('mongodb://157.230.57.197:27017/scarpingdemo');
mongoose.connect('mongodb://localhost:27017/scarpingdemo');
const Schema = mongoose.Schema;

app.use(cors())
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());


app.use('/api', route, controller)
app.use('/user', user)
console.log('todo list RESTful API server started on: ' + port);

app.listen(port);

new CronJob('0 0 */1 * * *', function () {
  console.log(new Date());
  //scrapData();
}, null, true, 'America/Los_Angeles');

//All Link to Scrap
//https://www.google.com/url?q=https://www.kijiji.ca/b-cars-trucks/edmonton-area/new__used/c174l1700202a49?for-sale-by%3Downr&sa=D&source=hangouts&ust=1554180402079000&usg=AFQjCNH2VVfHrstpHzSSlvWA_33AC0d0cQ
//https://www.google.com/url?q=https://www.kijiji.ca/b-cars-trucks/calgary/car/k0c174l1700199?for-sale-by%3Downr&sa=D&source=hangouts&ust=1554180402080000&usg=AFQjCNHUp8EGuz8IT1g0g3XitsxZhBAbgw

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


