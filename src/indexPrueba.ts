// import { MessagingService, 
//     RequestPayload, 
//     RequestResponse, 
//     RequestEnum, 
//     formatRequest, 
//     Source,
//     RequestWhereType,
//     RequestWhere,
// SocialMediaRequestPayload, 
// SocialMediaRequestResponse,
// FacebookPost,
// Insight,
// InsightType,
// ReadPostResponseContent,
// ReadPostRequestContent} from 'influencers-service-bus';
// import * as globalModels from 'influencers-models';
// import * as lodash from 'lodash';
// import 'dotenv/config';


// let item = new FacebookPost();
// item.insigths = [];

// let comment1 = new Insight(InsightType.COMMENT, "usuarioComment1");
// let comment2 = new Insight(InsightType.COMMENT, "usuarioComment2");
// let shares1 = new Insight(InsightType.SHARE, "usuarioShares1");
// let shares2 = new Insight(InsightType.SHARE, "usuarioShares12");
// let likes1 = new Insight(InsightType.LIKE, "usuarioReactions1");
// let likes2 = new Insight(InsightType.LIKE, "usuarioReactions2");

// item.insigths.push(comment1);
// item.insigths.push(comment2);

// item.insigths.push(shares1);
// item.insigths.push(shares2);

// item.insigths.push(likes1);
// item.insigths.push(likes2);

// let arrayInsights = item.insigths.reduce((object, item) =>{
//     object.push({type: item.type, platformObjectId: item.userName});
//     return object;
// }, []);

// console.log('imprimo array mod: ', arrayInsights);

// var insightsInBD = [{
//     type: InsightType.COMMENT,
//     platformObjectId: "usuarioComment1"
// },
// {
//     type: InsightType.LIKE,
//     platformObjectId: "usuarioReactions1"
// },
// {
//     type: InsightType.LIKE,
//     platformObjectId: "usuarioReactions2"
// },
// {
//     type: InsightType.LIKE,
//     platformObjectId: "usuarioShares1"
// }];

// console.log('imprimo array de BD: ', insightsInBD);

// var newSMs1 = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.type );
// var newSMs2 = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.platformObjectIdentity );
// var newSM3 = lodash.union(newSMs1, newSMs2);

// console.log('------------');
// console.log(newSMs1);
// console.log('------------');
// console.log(newSMs2);
// console.log('------------');
// console.log(newSM3);
import * as Cryptr from 'cryptr';
const cryptr = new Cryptr('myTotalySecretKey');
 
const encryptedString = cryptr.encrypt('bacon');
const decryptedString = cryptr.decrypt(encryptedString);
 
console.log(encryptedString); // 5590fd6409be2494de0226f5d7
console.log(decryptedString); // bacon