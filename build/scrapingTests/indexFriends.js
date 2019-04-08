"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const webdriver1 = require("selenium-webdriver");
const influencers_service_bus_1 = require("influencers-service-bus");
const lodash = require("lodash");
const chrome_1 = require("selenium-webdriver/chrome");
var webDriver = webdriver1;
var By = webDriver.By;
var WebElement = webDriver.WebElement;
var until = webDriver.until;
var keys = webDriver.Key;
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        var driver = yield new webDriver.Builder()
            .forBrowser('chrome')
            .setChromeOptions(new chrome_1.Options().addArguments("--disable-notifications").addArguments("--headless"))
            .build();
        yield driver.get('https://www.facebook.com/');
        yield driver.findElement(By.id("email")).sendKeys('ra_cl@hotmail.com');
        yield driver.findElement(By.id("pass")).sendKeys('Racing2018');
        // await driver.findElement(By.id("email")).sendKeys('open_vqmiush_user@tfbnw.net');
        // await driver.findElement(By.id("pass")).sendKeys('Gmatias1234!');
        yield driver.findElement(By.id('loginbutton')).submit();
        yield driver.get('https://www.facebook.com/mario.ruizdiaz.5/friends');
        //---------------------------obtengo los comentarios-------------------
        let commentsResult = yield driver.wait(check_Friends(), 100000);
        let relationshipResponse = new influencers_service_bus_1.RelationshipPostResponseContent(commentsResult);
        console.log(relationshipResponse);
    }
    finally {
        //await driver.quit();
    }
    function check_Friends() {
        return __awaiter(this, void 0, void 0, function* () {
            yield driver.sleep(4000);
            let condition = true;
            while (condition) {
                try {
                    let item = yield driver.findElement(By.className('mbm _5vf sectionHeader _4khu'));
                    console.log('encontre el elemento debajo de amigos', item);
                    condition = false;
                }
                catch (error) {
                    console.log('no encontre el item debajo de amigos');
                }
                yield driver.executeScript("window.scrollBy(0,2000)");
            }
            let lies = yield driver.findElements(By.xpath("//*[@class='uiList _262m _4kg']/li/div/a"));
            let friends = yield Promise.all(lies.map(function (item) {
                return __awaiter(this, void 0, void 0, function* () {
                    //let href = await item.findElement(By.xpath("//*[@class='clearfix _5qo4']/a")).getAttribute("href");
                    var href = yield item.getAttribute("href");
                    href = href.split('/')[3];
                    href = href.split('?')[0];
                    return href;
                });
            }));
            //----------------------------------------
            let lies2 = yield driver.findElements(By.xpath("//*[@class='uiList _262m expandedList _4kg']/li/div/a"));
            let friends2 = yield Promise.all(lies2.map(function (item) {
                return __awaiter(this, void 0, void 0, function* () {
                    //let href = await item.findElement(By.xpath("//*[@class='clearfix _5qo4']/a")).getAttribute("href");
                    var href = yield item.getAttribute("href");
                    href = href.split('/')[3];
                    href = href.split('?')[0];
                    return href;
                });
            }));
            return lodash.union(friends, friends2);
        });
    }
}))();
//# sourceMappingURL=indexFriends.js.map