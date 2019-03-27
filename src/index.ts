import * as webdriver1 from 'selenium-webdriver';
import tags from './tags';
var webDriver = webdriver1;
var By = webDriver.By;
var WebElement = webDriver.WebElement;
var until = webDriver.until;

(async () => {
    try{
        var driver = await  new webDriver.Builder().forBrowser('chrome').build();

        await driver.get('https://www.facebook.com/');
        await driver.findElement(By.id("email")).sendKeys('open_vqmiush_user@tfbnw.net');
        await driver.findElement(By.id("pass")).sendKeys('Gmatias1234!');
        await driver.findElement(By.id('loginbutton')).submit();

        console.log(
        );

    } finally {
        //await driver.quit();
    }

})();