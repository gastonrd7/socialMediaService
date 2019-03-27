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
        await driver.findElement(By.id("email")).sendKeys('tonga_matias@live.com');
        await driver.findElement(By.id("pass")).sendKeys('Gmatias1234');
        await driver.findElement(By.id('loginbutton')).submit();
        
        //link sin comentarios y compartida
        //await driver.get('https://www.facebook.com/photo.php?fbid=1714123008710413&set=a.113425535446843&type=3&theater');
        await driver.get('https://www.facebook.com/photo.php?fbid=10154029892354487&set=t.100003381922222&type=3&theater');
        //link con comentarios
        //await driver.get('https://www.facebook.com/photo.php?fbid=2425556284233745&set=a.1377560732366644&type=3&theater');
    
        
        //---------------------------obtengo los comentarios-------------------
        let comments = await driver.wait(check_Comments(), 100000);

        //---------------------------obtengo los shared-------------------
        let shared = await driver.wait(check_Shared(), 100000);

        //---------------------------obtengo las reacciones-------------------
        let reactions = await check_Reactions();

        console.log(
            reactions, 
            comments,
            shared
        );
    } finally {
        await driver.quit();
    }

async function check_Shared() {
     try{
        let item = await driver.findElement(By.className('_3rwx _42ft')).getAttribute('innerHTML');
        console.log(item);
        if(item.includes(tags["veces compartido"])) item = parseInt(item.substring(0, item.length - tags["veces compartido-Length"]));
        else if(item.includes(tags["vez compartidors"])) item = parseInt(item.substring(0, item.length - tags["vez compartido-Length"]));
        else if(item.includes(tags.Shares)) item = parseInt(item.substring(0, item.length - tags["shares-Length"]));
        else if(item.includes(tags.Share)) item = parseInt(item.substring(0, item.length - tags["share-Length"]));
        else return {shares: item, ok: false};
        return {shares: item, ok: true};
     } catch {
         return {"shares": 0, ok: false}
     }
    
}

async function check_Comments() {
    try{
        let items = await driver.findElements(By.className('_6qw4'));

        let results = await Promise.all(items.map(async function(item) {

            var userName = await item.getAttribute("href");
            userName = userName.split('/')[3];
        
            return {"userName": userName, ok: true};
        }));
    
        return {Type: "Comments", results, count: items.length, ok: true};

    } catch {
        let items = await driver.findElements(By.className('_6qw4'));
        return  [{Type: "Compartido", count: 0, detail: items, ok: false}];
    }
    
}

async function check_lies() {
    let lies = await driver.findElements(By.xpath("//*[@class='uiList _5i_n _4kg _6-h _6-j _6-i']/li/div/ul/li/div/div/div/div/div/div/a"));
    
    let reactions = await Promise.all(lies.map(async function(li) {
        let href = await li.getAttribute("href");

        href = href.split('?')[0];
        href = href.split('/')[3];

        return {"userName": href};
    }));

    return {type: "reactions", reactions, count: lies.length};
}

async function check_Reactions() {
    let url = await driver.findElement(By.className('_1n9l')).getAttribute("href");
    await driver.get(`${url}`);

    let reactions = await driver.wait(check_lies(), 100000);

    return reactions;
}

})();