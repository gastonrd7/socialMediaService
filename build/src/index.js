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
const dotenv = require("dotenv");
dotenv.config();
var init = false;
var run = true;
var processItem = true;
let name = 'backgroundService_postFeed';
(() => __awaiter(this, void 0, void 0, function* () {
    while (run) {
        if (!init) {
            yield influencers_service_bus_1.MessagingService.init();
            init = true;
        }
        try {
            let postToProcess = yield getPostToProcess();
            (postToProcess === null) ? processItem = false : processItem = true;
            console.log(postToProcess);
            if (processItem) {
                let postFacebook = yield readPostInSocialMedia(postToProcess);
                console.log(postFacebook);
                let insightsInBD = yield getInsights(postToProcess._id);
                let newPersons = yield newsPersonsToCreate(insightsInBD, postFacebook);
                yield createNewPersonCredentialInBD(newPersons, postToProcess._id, postToProcess.platform);
                let newInsights = yield newsInsightsToCreate(insightsInBD, postFacebook);
                createNewInsightsInDB(newInsights, postToProcess._id, postToProcess.platform);
                yield updatePostInDB(postToProcess);
            }
        }
        catch (err) {
            console.log('se rompo', err);
        }
    }
}))();
function updatePostInDB(postToProcess) {
    return __awaiter(this, void 0, void 0, function* () {
        var requestUpdate = new influencers_service_bus_1.RequestPayload();
        yield requestUpdate.init(globalModels.Model.post, null, null, { feedStatus: "Idle", feedDt: yield Date.now() }, postToProcess._id, null, null, null);
        var responseUpdate = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.UPDATE), requestUpdate));
    });
}
function readPostInSocialMedia(postToProcess) {
    return __awaiter(this, void 0, void 0, function* () {
        var readPostrequest = new influencers_service_bus_1.ReadPostRequestContent(postToProcess._id, postToProcess);
        var requestSocialMediaPost = new influencers_service_bus_1.SocialMediaRequestPayload(postToProcess.platform, readPostrequest);
        var responseSocialMedia = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.SOCIALMEDIA, influencers_service_bus_1.RequestEnum.SocialMedia_Request.READ_POST), requestSocialMediaPost));
        let postFacebook = responseSocialMedia.payload.post;
        return postFacebook;
    });
}
function getPostToProcess() {
    return __awaiter(this, void 0, void 0, function* () {
        var request = new influencers_service_bus_1.RequestPayload();
        yield request.init(globalModels.Model.post, null, [
            new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.LESSOREQUALTHAN, globalModels.postFields.feedStatus, yield (Date.now() - parseInt(process.env.FREQUENCY_OF_EXECUTION))),
            new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, globalModels.postFields.feedStatus, globalModels.postFeedStatusEnum.Idle)
        ], {
            [globalModels.postFields.feedStatus]: globalModels.postFeedStatusEnum.Fetching
        }, null, null, null, null, [globalModels.postFields.creationDt], true);
        var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.FIND_ONE_AND_UPDATE), request));
        return response.entity;
    });
}
function createNewInsightsInDB(newInsights, postId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(newInsights);
        try {
            newInsights.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                var request = new influencers_service_bus_1.RequestPayload();
                yield request.init(globalModels.Model.insight, null, null, {
                    [globalModels.insightFields.platform]: platform,
                    [globalModels.insightFields.platformObjectIdentity]: element.platformObjectIdentity,
                    [globalModels.insightFields.postId]: postId,
                    [globalModels.insightFields.type]: element.type
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
            if (item.userName === "anonymous")
                item.userName = null;
            object.push({ type: item.type, platformObjectIdentity: item.userName });
            return object;
        }, []);
        var toReturn = [];
        arrayInsights.forEach((element) => __awaiter(this, void 0, void 0, function* () {
            let exist = lodash.filter(insightsInBD, (r) => (r.type == element.type && r.platformObjectIdentity == element.platformObjectIdentity));
            if (exist.length === 0)
                toReturn.push(element);
        }));
        console.log(toReturn);
        return toReturn;
    });
}
function createNewPersonCredentialInBD(newPersons, postId, platform) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            newPersons.forEach((element) => __awaiter(this, void 0, void 0, function* () {
                var requestVerifyPerson_Credential = new influencers_service_bus_1.RequestPayload();
                yield requestVerifyPerson_Credential.init(globalModels.Model.person_credential, ["_id"], [
                    new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, globalModels.person_credentialFields.platformObjectIdentity, element.platformObjectIdentity),
                    new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, globalModels.person_credentialFields.platform, platform)
                ], null, null, null, null, null);
                var responseVerifyPerson_Credential = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.READ_ONE), requestVerifyPerson_Credential));
                if (!responseVerifyPerson_Credential.entity) {
                    var request = new influencers_service_bus_1.RequestPayload();
                    yield request.init(globalModels.Model.person_credential, null, null, {
                        [globalModels.person_credentialFields.platform]: platform,
                        [globalModels.person_credentialFields.platformObjectIdentity]: element.platformObjectIdentity,
                        [globalModels.person_credentialFields.status]: 'NOT_LINKED'
                    }, null, null, null, null);
                    var response = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.CREATE), request));
                }
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
            if (item.userName !== "anonymous")
                object.push({ type: item.type, platformObjectIdentity: item.userName });
            return object;
        }, []);
        var newPersons = lodash.differenceBy(arrayInsights, insightsInBD, globalModels.insightFields.platformObjectIdentity);
        return newPersons;
    });
}
function getInsights(postId) {
    return __awaiter(this, void 0, void 0, function* () {
        var request = new influencers_service_bus_1.RequestPayload();
        yield request.init(globalModels.Model.insight, [globalModels.insightFields.platformObjectIdentity, globalModels.insightFields.type], [
            new influencers_service_bus_1.RequestWhere(influencers_service_bus_1.RequestWhereType.EQUAL, "postId", postId)
        ], null, null, null, null, null, null, null);
        var responseInsigths = Object.assign(yield influencers_service_bus_1.MessagingService.request(name, yield influencers_service_bus_1.formatRequest(influencers_service_bus_1.Source.STORAGE, influencers_service_bus_1.RequestEnum.DataStorage_Request.READ_MANY), request));
        return responseInsigths.entities;
    });
}
//# sourceMappingURL=index.js.map