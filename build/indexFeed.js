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
const tags_1 = require("./tags");
var webDriver = webdriver1;
var By = webDriver.By;
var WebElement = webDriver.WebElement;
var until = webDriver.until;
(() => __awaiter(this, void 0, void 0, function* () {
    try {
        var driver = yield new webDriver.Builder().forBrowser('chrome').build();
        yield driver.get('https://www.facebook.com/');
        yield driver.findElement(By.id("email")).sendKeys('tonga_matias@live.com');
        yield driver.findElement(By.id("pass")).sendKeys('Gmatias1234');
        yield driver.findElement(By.id('loginbutton')).submit();
        //link sin comentarios y compartida
        //await driver.get('https://www.facebook.com/photo.php?fbid=1714123008710413&set=a.113425535446843&type=3&theater');
        yield driver.get('https://www.facebook.com/photo.php?fbid=10154029892354487&set=t.100003381922222&type=3&theater');
        //link con comentarios
        //await driver.get('https://www.facebook.com/photo.php?fbid=2425556284233745&set=a.1377560732366644&type=3&theater');
        //---------------------------obtengo los comentarios-------------------
        let comments = yield driver.wait(check_Comments(), 100000);
        //---------------------------obtengo los shared-------------------
        let shared = yield driver.wait(check_Shared(), 100000);
        //---------------------------obtengo las reacciones-------------------
        let reactions = yield check_Reactions();
        console.log(reactions, comments, shared);
    }
    finally {
        yield driver.quit();
    }
    function check_Shared() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let item = yield driver.findElement(By.className('_3rwx _42ft')).getAttribute('innerHTML');
                console.log(item);
                if (item.includes(tags_1.default["veces compartido"]))
                    item = parseInt(item.substring(0, item.length - tags_1.default["veces compartido-Length"]));
                else if (item.includes(tags_1.default["vez compartidors"]))
                    item = parseInt(item.substring(0, item.length - tags_1.default["vez compartido-Length"]));
                else if (item.includes(tags_1.default.Shares))
                    item = parseInt(item.substring(0, item.length - tags_1.default["shares-Length"]));
                else if (item.includes(tags_1.default.Share))
                    item = parseInt(item.substring(0, item.length - tags_1.default["share-Length"]));
                else
                    return { shares: item, ok: false };
                return { shares: item, ok: true };
            }
            catch (_a) {
                return { "shares": 0, ok: false };
            }
        });
    }
    function check_Comments() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let items = yield driver.findElements(By.className('_6qw4'));
                let results = yield Promise.all(items.map(function (item) {
                    return __awaiter(this, void 0, void 0, function* () {
                        var userName = yield item.getAttribute("href");
                        userName = userName.split('/')[3];
                        return { "userName": userName, ok: true };
                    });
                }));
                return { Type: "Comments", results, count: items.length, ok: true };
            }
            catch (_a) {
                let items = yield driver.findElements(By.className('_6qw4'));
                return [{ Type: "Compartido", count: 0, detail: items, ok: false }];
            }
        });
    }
    function check_lies() {
        return __awaiter(this, void 0, void 0, function* () {
            let lies = yield driver.findElements(By.xpath("//*[@class='uiList _5i_n _4kg _6-h _6-j _6-i']/li/div/ul/li/div/div/div/div/div/div/a"));
            let reactions = yield Promise.all(lies.map(function (li) {
                return __awaiter(this, void 0, void 0, function* () {
                    let href = yield li.getAttribute("href");
                    href = href.split('?')[0];
                    href = href.split('/')[3];
                    return { "userName": href };
                });
            }));
            return { type: "reactions", reactions, count: lies.length };
        });
    }
    function check_Reactions() {
        return __awaiter(this, void 0, void 0, function* () {
            let url = yield driver.findElement(By.className('_1n9l')).getAttribute("href");
            yield driver.get(`${url}`);
            let reactions = yield driver.wait(check_lies(), 100000);
            return reactions;
        });
    }
}))();
//# sourceMappingURL=indexFeed.js.map