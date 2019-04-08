import { MessagingService, 
    RequestPayload, 
    RequestResponse, 
    RequestEnum, 
    formatRequest, 
    Source,
    RequestWhereType,
    RequestWhere,
SocialMediaRequestPayload, 
SocialMediaRequestResponse,
FacebookPost,
Insight,
InsightType,
ReadPostResponseContent,
ReadPostRequestContent} from 'influencers-service-bus';
import * as globalModels from 'influencers-models';
import * as lodash from 'lodash';
import * as dotenv from "dotenv";
dotenv.config();

var init = false;
var run = true;
var processItem = true;
let name = 'backgroundService_postFeed';

(async () => {
    while(run) {
        if (!init) {
            await MessagingService.init();
            init = true;
        }

        try
        {   
            let postToProcess = await getPostToProcess();  
            
             (postToProcess === null) ? processItem = false : processItem = true;

            console.log(postToProcess);
            if (processItem) {
                let postFacebook = await readPostInSocialMedia(postToProcess);
                console.log(postFacebook);

                let insightsInBD = await getInsights(postToProcess._id);
                
                let newPersons = await newsPersonsToCreate(insightsInBD, postFacebook);
                await createNewPersonCredentialInBD(newPersons, postToProcess._id, postToProcess.platform);
                
                let newInsights = await newsInsightsToCreate(insightsInBD, postFacebook);
                createNewInsightsInDB(newInsights, postToProcess._id, postToProcess.platform);

                await updatePostInDB(postToProcess);
            }
        }
        catch (err)
        {
            console.log('se rompo', err);
        }
    }
})();

async function updatePostInDB(postToProcess) {
    var requestUpdate = new RequestPayload();
    await requestUpdate.init(globalModels.Model.post, null, null, {feedStatus: "Idle", feedDt: await Date.now()}, postToProcess._id, null, null, null);
    var responseUpdate : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.UPDATE), requestUpdate));
}

async function readPostInSocialMedia(postToProcess) {
    var readPostrequest = new ReadPostRequestContent(postToProcess._id, postToProcess);
    var requestSocialMediaPost = new SocialMediaRequestPayload(postToProcess.platform, readPostrequest);
    var responseSocialMedia : SocialMediaRequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.SOCIALMEDIA, RequestEnum.SocialMedia_Request.READ_POST), requestSocialMediaPost));
    let postFacebook : FacebookPost = (responseSocialMedia.payload as ReadPostResponseContent).post as FacebookPost;

    return postFacebook;
}

async function getPostToProcess() {
    var request = new RequestPayload();
    await request.init(globalModels.Model.post, null, 
    [
        new RequestWhere(RequestWhereType.LESSOREQUALTHAN, globalModels.postFields.feedStatus,  await (Date.now() - parseInt(process.env.FREQUENCY_OF_EXECUTION))),
        new RequestWhere(RequestWhereType.EQUAL, globalModels.postFields.feedStatus, globalModels.postFeedStatusEnum.Idle)
    ],
    {
        [globalModels.postFields.feedStatus]: globalModels.postFeedStatusEnum.Fetching
    }, 
    null, null, null, null, [globalModels.postFields.creationDt], true);
    
    var response : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.FIND_ONE_AND_UPDATE), request));

    return response.entity;
}

async function createNewInsightsInDB(newInsights, postId, platform) {
    console.log(newInsights);
    try {
        newInsights.forEach(async element => {
            var request = new RequestPayload();
            await request.init(globalModels.Model.insight, null, null, {
            [globalModels.insightFields.platform]: platform,
            [globalModels.insightFields.platformObjectIdentity]: element.platformObjectIdentity,
            [globalModels.insightFields.postId]: postId,
            [globalModels.insightFields.type]: element.type
            }, null, null, null, null);
    
            var response : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.CREATE), request));
        });
    } catch (error) {
        throw(error)
    }
}

async function newsInsightsToCreate(insightsInBD, post: FacebookPost) {
    
    let arrayInsights = await post.insigths.reduce((object, item) =>{
        if (item.userName === "anonymous") item.userName = null;

        object.push({type: item.type, platformObjectIdentity: item.userName});
        return object;
    }, []);

    var toReturn = [];
    arrayInsights.forEach(async element => {
        let exist = lodash.filter(insightsInBD, (r) => (r.type == element.type && r.platformObjectIdentity == element.platformObjectIdentity));
        if(exist.length === 0) toReturn.push(element);
    });
    console.log(toReturn);
    return toReturn;
}



async function createNewPersonCredentialInBD(newPersons, postId, platform) {
    try {
        newPersons.forEach(async element => {
            var requestVerifyPerson_Credential = new RequestPayload();
            await requestVerifyPerson_Credential.init(globalModels.Model.person_credential, ["_id"], 
                [
                    new RequestWhere(RequestWhereType.EQUAL, globalModels.person_credentialFields.platformObjectIdentity, element.platformObjectIdentity),
                    new RequestWhere(RequestWhereType.EQUAL, globalModels.person_credentialFields.platform, platform)
                ],
                null, null, null, null, null);
            var responseVerifyPerson_Credential : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.READ_ONE), requestVerifyPerson_Credential));
            if(!responseVerifyPerson_Credential.entity) {
                var request = new RequestPayload();
                await request.init(globalModels.Model.person_credential, null, null, {
                [globalModels.person_credentialFields.platform]: platform,
                [globalModels.person_credentialFields.platformObjectIdentity]: element.platformObjectIdentity,
                [globalModels.person_credentialFields.status]: 'NOT_LINKED'
                }, null, null, null, null);
        
                var response : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.CREATE), request));
            }
        });
    } catch (error) {
        throw(error)
    }
    
}
async function newsPersonsToCreate(insightsInBD, post: FacebookPost): Promise<{type: InsightType, platformObjectIdentity: String}> {

    let arrayInsights = post.insigths.reduce((object, item) =>{
        if(item.userName !== "anonymous") object.push({type: item.type, platformObjectIdentity: item.userName});
        return object;
    }, []);
    var newPersons = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.platformObjectIdentity);

    return newPersons;
}

async function getInsights(postId: String) {
    var request = new RequestPayload();
    await request.init(globalModels.Model.insight, [globalModels.insightFields.platformObjectIdentity, globalModels.insightFields.type],
    [
      new RequestWhere(RequestWhereType.EQUAL, "postId", postId)  
    ], null, null, null, null, null, null, null);

    var responseInsigths : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.READ_MANY), request));

    return responseInsigths.entities;
}


