// import * as webdriver1 from 'selenium-webdriver';
// import tags from './tags';
// import { 
//     FacebookPost,
//     FacebookComment,
//     FacebookShares,
//     FacebookReactions
// } from 'influencers-service-bus';
// var webDriver = webdriver1;
// var By = webDriver.By;
// var WebElement = webDriver.WebElement;
// var until = webDriver.until;
// (async () => {
//     try{
//         var driver = await  new webDriver.Builder().forBrowser('chrome').build();
//         await driver.get('https://www.facebook.com/');
//         // await driver.findElement(By.id("email")).sendKeys('tonga_matias@live.com');
//         // await driver.findElement(By.id("pass")).sendKeys('Gmatias1234');
//         await driver.findElement(By.id("email")).sendKeys('open_vqmiush_user@tfbnw.net');
//         await driver.findElement(By.id("pass")).sendKeys('Gmatias1234!');
//         await driver.findElement(By.id('loginbutton')).submit();
//         //link sin comentarios y compartida
//         //---foto con todo-----
//         //https://www.facebook.com/photo.php?fbid=10154029892354487&set=t.100003381922222&type=3&theater
//         //---foto sin nada-------
//         //https://www.facebook.com/photo.php?fbid=396258681155912&set=a.395296871252093&type=3&theater
//         await driver.get('https://www.facebook.com/photo.php?fbid=396258681155912&set=a.395296871252093&type=3&theater');
//         //link con comentarios
//         //await driver.get('https://www.facebook.com/photo.php?fbid=2425556284233745&set=a.1377560732366644&type=3&theater');
//         //---------------------------obtengo los comentarios-------------------
//         let commentsResult = await driver.wait(check_Comments(), 100000);
//         //---------------------------obtengo los shared-------------------
//         let sharesResult = await driver.wait(check_Shared(), 100000);
//         //---------------------------obtengo las reacciones-------------------
//         let reactionsResult = await check_Reactions();
//         let facebookPost = new FacebookPost();
//         facebookPost.comments = [];
//         facebookPost.shares = [];
//         facebookPost.likes = [];
//         commentsResult.comments.forEach(element => {
//             let comment = new FacebookComment();
//             comment.userName = element.userName;
//             facebookPost.comments.push(comment);
//         });
//         for (let index = 0; index < sharesResult.shares; index++) {
//             let share = new FacebookShares();
//             share.userName = "anonymous";
//             facebookPost.shares.push(share);
//         }
//         reactionsResult.reactions.forEach(element => {
//             let reaction = new FacebookReactions();
//             reaction.userName = element.userName;
//             facebookPost.likes.push(reaction);
//         });
//         console.log(
//             facebookPost
//         );
//     } finally {
//         await driver.quit();
//     }
// async function check_Shared() {
//      try{
//         let item : string = await driver.findElement(By.className('_3rwx _42ft')).getAttribute('innerHTML');
//         console.log(item);
//         let itemCount = 0;
//         if(item.includes(tags["veces compartido"])) itemCount = parseInt(item.substring(0, item.length - tags["veces compartido-Length"]));
//         else if(item.includes(tags["vez compartidors"])) itemCount = parseInt(item.substring(0, item.length - tags["vez compartido-Length"]));
//         else if(item.includes(tags.Shares)) itemCount = parseInt(item.substring(0, item.length - tags["shares-Length"]));
//         else if(item.includes(tags.Share)) itemCount = parseInt(item.substring(0, item.length - tags["share-Length"]));
//         else return {shares: itemCount, ok: false};
//         return {shares: itemCount, ok: true};
//      } catch {
//          return {"shares": 0, ok: false}
//      }
// }
// async function check_Comments() :Promise< {Type: String, comments: { "userName": string, ok: boolean }[], count: number, ok: boolean}> {
//     try{
//         let items = await driver.findElements(By.className('_6qw4'));
//         let comments = await Promise.all(items.map(async function(item) {
//             var userName = await item.getAttribute("href");
//             userName = userName.split('/')[3];
//             return {"userName": userName, ok: true};
//         }));
//         return {Type: "comments", comments, count: items.length, ok: true};
//     } catch {
//         let items = await driver.findElements(By.className('_6qw4'));
//         return {Type: "comments", comments: null, count: 0, ok: false};
//     }
// }
// async function check_lies() {
//     let lies = await driver.findElements(By.xpath("//*[@class='uiList _5i_n _4kg _6-h _6-j _6-i']/li/div/ul/li/div/div/div/div/div/div/a"));
//     let reactions = await Promise.all(lies.map(async function(li) {
//         let href = await li.getAttribute("href");
//         href = href.split('?')[0];
//         href = href.split('/')[3];
//         return {"userName": href};
//     }));
//     return {type: "reactions", reactions, count: lies.length};
// }
// async function check_Reactions() {
//     try {
//         let url = await driver.findElement(By.className('_1n9l')).getAttribute("href");
//         await driver.get(`${url}`);
//         let reactions = await driver.wait(check_lies(), 100000);
//         return reactions;
//     } catch (error) {
//         return {type: "reactions", reactions: [], count: 0}
//     }
// }
// })();
//# sourceMappingURL=indexScraping.js.map