import * as webdriver1 from 'selenium-webdriver';
import tags from './tags';
import { 
    RelationshipPostResponseContent
} from 'influencers-service-bus';
import * as lodash from 'lodash';
import { Options } from 'selenium-webdriver/chrome';
var webDriver = webdriver1;
var By = webDriver.By;
var WebElement = webDriver.WebElement;
var until = webDriver.until;
var keys = webDriver.Key;

(async () => {
    try{

        var driver = await  new webDriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(new Options().addArguments("--disable-notifications").addArguments("--headless"))
            .build();
        await driver.get('https://www.facebook.com/');
        await driver.findElement(By.id("email")).sendKeys('ra_cl@hotmail.com');
        await driver.findElement(By.id("pass")).sendKeys('Racing2018');
        // await driver.findElement(By.id("email")).sendKeys('open_vqmiush_user@tfbnw.net');
        // await driver.findElement(By.id("pass")).sendKeys('Gmatias1234!');
        await driver.findElement(By.id('loginbutton')).submit();
        
        await driver.get('https://www.facebook.com/mario.ruizdiaz.5/friends');


    
        
        //---------------------------obtengo los comentarios-------------------
        let commentsResult = await driver.wait(check_Friends(), 100000);

        let relationshipResponse = new RelationshipPostResponseContent(commentsResult);

        console.log(
            relationshipResponse
        );
    } finally {
        //await driver.quit();
    }
async function check_Friends() {
    await driver.sleep(4000);

    let condition = true;
    while (condition) {
        try {
            let item = await driver.findElement(By.className('mbm _5vf sectionHeader _4khu'));
            console.log('encontre el elemento debajo de amigos', item);
            condition = false;
        } catch (error) {
            console.log('no encontre el item debajo de amigos');
        }
        await driver.executeScript("window.scrollBy(0,2000)");
    }

    let lies = await driver.findElements(By.xpath("//*[@class='uiList _262m _4kg']/li/div/a"));

    let friends = await Promise.all(lies.map(async function(item) {
        //let href = await item.findElement(By.xpath("//*[@class='clearfix _5qo4']/a")).getAttribute("href");
        var href = await item.getAttribute("href");
        href = href.split('/')[3];
        href = href.split('?')[0];
    
        return href;
    }));

    //----------------------------------------

    let lies2 = await driver.findElements(By.xpath("//*[@class='uiList _262m expandedList _4kg']/li/div/a"));

    let friends2 = await Promise.all(lies2.map(async function(item) {
        //let href = await item.findElement(By.xpath("//*[@class='clearfix _5qo4']/a")).getAttribute("href");
        var href = await item.getAttribute("href");
        href = href.split('/')[3];
        href = href.split('?')[0];
    
        return href;
    }));

    return lodash.union(friends, friends2);
}

})();