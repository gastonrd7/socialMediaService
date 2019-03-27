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
var webDriver = webdriver1;
var By = webDriver.By;
var WebElement = webDriver.WebElement;
var until = webDriver.until;
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        var driver = yield new webDriver.Builder().forBrowser('chrome').build();
        yield driver.get('https://www.facebook.com/');
        yield driver.findElement(By.id("email")).sendKeys('open_vqmiush_user@tfbnw.net');
        yield driver.findElement(By.id("pass")).sendKeys('Gmatias1234!');
        yield driver.findElement(By.id('loginbutton')).submit();
        console.log();
    }
    finally {
        //await driver.quit();
    }
}))();
//# sourceMappingURL=index.js.map