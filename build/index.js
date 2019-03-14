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
const influencers_service_bus_1 = require("influencers-service-bus");
const globalModels = require("influencers-models");
require("dotenv/config");
var init = false;
(() => __awaiter(this, void 0, void 0, function* () {
    while (!init) {
        console.log(init);
        if (!init) {
            yield influencers_service_bus_1.MessagingService.init();
            init = true;
        }
        let name = 'backgroundService_postFeed';
        try {
            //Lectura del post a procesar          
            var request = new influencers_service_bus_1.RequestPayload();
            let now = yield Date.now();
            yield request.init(globalModels.Model.post, null, [
                new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.LESSOREQUALTHAN, "feedDt", now),
            ], {
                feedStatus: "Fetching"
            }, null, null, null, null, ["creationDt"], true);
            console.log(request);
            var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.FIND_ONE_AND_UPDATE), request));
            console.log(response);
            //Solicito actualizar Post
            var post = new influencers_service_bus_1.ReadPostRequestContent(response.entity._id, response.entity);
            var requestSocialMediaPost = new influencers_service_bus_1.SocialMediaRequestPayload(response.entity.platform, post);
            console.log(requestSocialMediaPost);
            var responseSocialMedia = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.SOCIALMEDIA, influencers_service_bus_1.RequestEnum.SocialMedia_Request.READ_POST), requestSocialMediaPost));
            console.log(responseSocialMedia);
            //Actualizo en la BD con la info actualizada
        }
        catch (err) {
            console.log('se rompo', err);
            //return Promise.reject("Error in company budgetAvailable. Error: " + JSON.stringify(err));
        }
    }
}))();
//# sourceMappingURL=index.js.map