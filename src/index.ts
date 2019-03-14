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
ReadPostRequestContent} from 'influencers-service-bus';
import * as globalModels from 'influencers-models';
import 'dotenv/config';


var init = false;
var run = true;

(async () => {
    while(run) {
        console.log(init);
        if (!init) {
            await MessagingService.init();
            init = true;
        }
        let name = 'backgroundService_postFeed';

        try
        {
            //Lectura del post a procesar          
            var request = new RequestPayload();
            await request.init( globalModels.Model.post, null, 
            [
                new RequestWhere(RequestWhereType.LESSOREQUALTHAN, "feedDt",  await (Date.now() - (10 * 60 * 1000))),
                new RequestWhere(RequestWhereType.EQUAL, "feedStatus", "Idle")
            ],
            {
                feedStatus: "Fetching"
            }, 
            null, null, null, null, ["creationDt"], true);
            
            console.log(request);
            var response : RequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.FIND_ONE_AND_UPDATE), request));
            console.log(response);

            if (response.entity === null) run = false;
            
            if (run) {
                //Solicito actualizar Post
                var post = new ReadPostRequestContent(response.entity._id, response.entity);

                var requestSocialMediaPost = new SocialMediaRequestPayload(response.entity.platform, post);

                console.log(requestSocialMediaPost);
                var responseSocialMedia : SocialMediaRequestResponse = Object.assign(await MessagingService.request(name, await formatRequest(Source.SOCIALMEDIA, RequestEnum.SocialMedia_Request.READ_POST), requestSocialMediaPost));
                console.log(responseSocialMedia);

                //Actualizo en la BD con la info actualizada
                var requestUpdate = new RequestPayload();
                await requestUpdate.init(globalModels.Model.post, null, null, {postPlatformFeed: JSON.stringify(responseSocialMedia.post), feedStatus: "Idle", feedDt: await Date.now()}, response.entity._id, null, null, null);
                var responseUpdate : RequestResponse = Object.assign(await MessagingService.request(this.name, await formatRequest(Source.STORAGE, RequestEnum.DataStorage_Request.UPDATE), requestUpdate));
                console.log(responseUpdate);
            }
            
        }
        catch (err)
        {
            console.log('se rompo', err);
            //return Promise.reject("Error in company budgetAvailable. Error: " + JSON.stringify(err));
        }
    }
})();


