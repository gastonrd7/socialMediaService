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
const lodash = require("lodash");
require("dotenv/config");
var init = false;
var run = true;
(() => __awaiter(this, void 0, void 0, function* () {
    console.log(run);
    while (run) {
        console.log(init);
        if (!init) {
            yield influencers_service_bus_1.MessagingService.init();
            init = true;
        }
        let name = 'backgroundService_postFeed';
        try {
            //Lectura del post a procesar          
            var request = new influencers_service_bus_1.RequestPayload();
            yield request.init(globalModels.Model.post, null, [
                new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.LESSOREQUALTHAN, "feedDt", yield (Date.now() - (60 * 1000))),
                new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, "feedStatus", "Idle")
            ], {
                feedStatus: "Fetching"
            }, null, null, null, null, ["creationDt"], true);
            var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.FIND_ONE_AND_UPDATE), request));
            if (response.entity === null)
                run = false;
            if (run) {
                //Solicito actualizar Post
                var readPostrequest = new influencers_service_bus_1.ReadPostRequestContent(response.entity._id, response.entity);
                var requestSocialMediaPost = new influencers_service_bus_1.SocialMediaRequestPayload(response.entity.platform, readPostrequest);
                var responseSocialMedia = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.SOCIALMEDIA, influencers_service_bus_1.RequestEnum.SocialMedia_Request.READ_POST), requestSocialMediaPost));
                let postFacebook = responseSocialMedia.payload.post;
                console.log(postFacebook);
                let insightsInBD = yield getInsights(response.entity._id);
                let newPersons = yield newsPersonsToCreate(insightsInBD, postFacebook);
                yield createNewPersonCredentialInBD(newPersons, response.entity._id, response.entity.platform);
                let newInsights = yield newsInsightsToCreate(insightsInBD, postFacebook);
                createNewInsightsInBD(newInsights, response.entity._id, response.entity.platform);
                //Actualizo en la BD con la info actualizada
                var requestUpdate = new influencers_service_bus_1.RequestPayload();
                yield requestUpdate.init(globalModels.Model.post, null, null, { feedStatus: "Idle", feedDt: yield Date.now() }, response.entity._id, null, null, null);
                var responseUpdate = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.UPDATE), requestUpdate));
            }
        }
        catch (err) {
            console.log('se rompo', err);
            //return Promise.reject("Error in company budgetAvailable. Error: " + JSON.stringify(err));
        }
    }
}))();
function createNewInsightsInBD(newInsights, postId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            newInsights.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                var request = new influencers_service_bus_1.RequestPayload();
                yield request.init(globalModels.Model.insight, null, null, {
                    [globalModels.insightFields.platform]: platform,
                    [globalModels.insightFields.platformObjectId]: element.platformObjectId,
                    [globalModels.insightFields.postId]: postId
                }, null, null, null, null);
                var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.CREATE), request));
            }));
        }
        catch (error) {
            throw (error);
        }
    });
}
function newsInsightsToCreate(insightsInBD, post) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayInsights = yield post.insigths.reduce((object, item) => {
            object.push({ type: item.type, platformObjectId: item.userName });
            return object;
        }, []);
        var newSMs1 = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.type);
        var newSMs2 = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.platformObjectId);
        return lodash.union(newSMs1, newSMs2);
    });
}
function createNewPersonCredentialInBD(newPersons, postId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            newPersons.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                var request = new influencers_service_bus_1.RequestPayload();
                yield request.init(globalModels.Model.person_credential, null, null, {
                    [globalModels.person_credentialFields.platform]: platform,
                    [globalModels.person_credentialFields.platformObjectId]: element.platformObjectId,
                    [globalModels.person_credentialFields.status]: 'NOT_LINKED'
                }, null, null, null, null);
                var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.CREATE), request));
            }));
        }
        catch (error) {
            throw (error);
        }
    });
}
function newsPersonsToCreate(insightsInBD, post) {
    return __awaiter(this, void 0, void 0, function* () {
        let arrayInsights = post.insigths.reduce((object, item) => {
            object.push({ type: item.type, platformObjectId: item.userName });
            return object;
        }, []);
        var newPersons = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.platformObjectId);
        return newPersons;
    });
}
function getInsights(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        var request = new influencers_service_bus_1.RequestPayload();
        yield request.init(globalModels.Model.insight, [globalModels.insightFields.platformObjectId, globalModels.insightFields.type], [
            new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, "postId", postId)
        ], null, null, null, null, null, null, null);
        var responseInsigths = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.READ_MANY), request));
        return responseInsigths.entities;
    });
}
//# sourceMappingURL=index2.js.map