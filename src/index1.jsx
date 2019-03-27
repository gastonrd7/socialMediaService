//import webdriver from 'selenium-webdriver';
var webDriver = require('selenium-webdriver');
var By = webDriver.By;
var until = webDriver.until;

(async () => {
var driver = await  new webDriver.Builder().forBrowser('chrome').build();

await driver.get('http://www.google.com/ncr');
await driver.findElement(By.name('q')).sendKeys('wiki');
await driver.findElement(By.name('btnK')).submit();
await driver.wait(check_title, 10000);

async function check_title() {
    console.log('entro');
    var promise = driver.getTitle().then( function(title){
        if(title === 'wiki - Google Search') {
            console.log("seccess");
            return true;
        } else {
            console.log('fail -- ', title);
        }
    })

    return promise;
}
})();