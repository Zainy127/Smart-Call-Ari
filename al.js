const axios = require('axios');
const defaultConfig = require('./config.json');
const moment = require('moment');
const url = require("url");
const http = require('http');

const keepaliveAgent = new http.Agent(
{
    keepAlive: true
});
//import camelcaseKeys from 'camelcase-keys';

class al
{
    getGlobalBlacklist(a_party, uuid)
    {
        // function for getGlobalBlacklist api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] global blacklist API called with " + a_party);


        let a_party_num = a_party;
        let payload = {
            a_party_num
        };
        const params = new url.URLSearchParams(payload);

        let param1 = params.toString();
        let result = param1.replace("a_party_num=", "");
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] Params Sent : " + result);

        return axios.get(`${defaultConfig.globalBlacklist}${result}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus blackLists  api call => ${defaultConfig.prometheusApi}blackLists`);
                axios.get(`${defaultConfig.prometheusApi}blackLists`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus blackLists api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus blackLists api => ", err.message);
                });
                return response.data;
            })
            .catch((error) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus blackListsApiNotResponding  api call => ${defaultConfig.prometheusApi}blackListsApiNotResponding`);


                axios.get(`${defaultConfig.prometheusApi}blackListsApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus blackListsApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus blackListsApiNotResponding api  => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);

                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });


                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    userSpecificBlacklist(c_party, a_party, uuid)
    { // function for userSpecificBlacklist api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] userSpecificBlacklist API called with cParty:" + c_party + " & aParty " + a_party);
        let a_party_num = a_party.substring(1);
        let payload = {
            c_party,
            a_party_num
        };
        const params = new url.URLSearchParams(payload);


        let param1 = params.toString();

        let resultSub = param1.replace("c_party=", "");
        let result = resultSub.replace("&a_party_num=", "/");
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] Params Sent : " + result);


        return axios
            .get(`${defaultConfig.userSpecificBlacklist}${result}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {
                return response.data;
            })
            .catch((error) =>
            {
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    getSubscriber(c_party, pincode, uuid)
    {
        // function for getSubscriber api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] getSubscriber API called with cParty:" + c_party + " & pincode:" + pincode);
        let payload = {
            c_party,
            pincode
        };
        const params = new url.URLSearchParams(payload);
        let param1 = params.toString();
        let resultSub = param1.replace("c_party=", "");
        let result = resultSub.replace("&pincode=", "/");
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] Params Sent : " + result);
        return axios
            .get(`${defaultConfig.getSubscriberByPin}${result}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {
                return response.data;
            })
            .catch((error) =>
            {
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    getVoiceCallCounter(c_party, uuid)
    { // function for getVoiceCallCounter api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] getVoiceCallCounter API called with " + c_party);
        let payload = {
            c_party
        };
        const params = new url.URLSearchParams(payload);
        // console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ map1.get(incomingNumber).uuid+"] Params Sent : " + params);
        let param1 = params.toString();
        let result = param1.replace("c_party=", "");
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] Params Sent : " + result);
        return axios
            .get(`${defaultConfig.getVoiceCallCounter}${result}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {
                return response.data;
            })
            .catch((error) =>
            {
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    updateVoiceCallCounter(c_party, uuid)
    { // function for updateVoiceCallCounter api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] updateVoiceCallCounter API called with " + c_party);
        let payload = {
            c_party
        };
        const params = new url.URLSearchParams(payload);
        let param1 = params.toString();
        let result = param1.replace("c_party=", "");
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] Params Sent : " + result);
        return axios
            .put(`${defaultConfig.updateVoiceCallCounter}${result}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus updatevcallcounter  api call => ${defaultConfig.prometheusApi}updatevcallcounter`);
                axios.get(`${defaultConfig.prometheusApi}updatevcallcounter`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus updatevcallcounter api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus updatevcallcounter api => ", err.message);
                });

                // console.log("updateVoiceCallCounter api response:"+response.toString());
                return response.data;
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus updatevcallcounterApiNotResponding  api call => ${defaultConfig.prometheusApi}updatevcallcounterApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}updatevcallcounterApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus updatevcallcounterApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log(" error in Promethus updatevcallcounterApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }




    getVoiceCallProcessInfo(payload)
    {

        // function for getVoiceCallProcessInfo api call

        const cParty = payload.toNumber;
        const aParty = payload.fromNumber;
        const channel = payload.channel;
        const uuid = payload.uuid;


        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+uuid+"]payload recieved  for getVoiceCallProcessInfo api " + JSON.stringify(payload));        
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] getVoiceCallProcessInfo API ==> " + defaultConfig.getVoiceCallProcessInfo + cParty + "/" + channel + "/" + aParty);


        return axios.get(`${defaultConfig.getVoiceCallProcessInfo}${cParty}/${channel}/${aParty}`,
            {
                httpAgent: keepaliveAgent
            })
            .then((response) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus voicecallprocess  api call => ${defaultConfig.prometheusApi}voicecallprocess`);


                axios.get(`${defaultConfig.prometheusApi}voicecallprocess`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus voicecallprocess api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus voicecallprocess api => ", err.message);
                });

                return response.data;
            })
            .catch((error) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus voicecallprocessApiNotResponding  api call => ${defaultConfig.prometheusApi}voicecallprocessApiNotResponding`);

                axios.get(`${defaultConfig.prometheusApi}voicecallprocessApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus voicecallprocessApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus voicecallprocessApiNotResponding api  => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);


                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }


    getPINProcessInfo(payload)
    {
        // function for getPINProcessInfo api call
        const cParty = payload.toNumber;
        const aParty = payload.fromNumber;
        const pincode = payload.pincode;
        const channel = payload.channel;
        const uuid = payload.uuid;
        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+uuid+"]payload recieved  for getPINProcessInfo api " + JSON.stringify(payload));  
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] getPINProcessInfo API ==> " + defaultConfig.getPINProcessInfo + cParty + "/" + channel + "/" + pincode + "/" + aParty);


        return axios.get(`${defaultConfig.getPINProcessInfo}${cParty}/${channel}/${pincode}/${aParty}`,
            {
                httpAgent: keepaliveAgent
            }).then((response) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus pinprocess  api call => ${defaultConfig.prometheusApi}pinprocess`);


                axios.get(`${defaultConfig.prometheusApi}pinprocess`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus pinprocess api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus pinprocess api => ", err.message);
                });


                return response.data;
            })
            .catch((error) =>
            {


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus pinprocessApiNotResponding  api call => ${defaultConfig.prometheusApi}pinprocessApiNotResponding`);

                axios.get(`${defaultConfig.prometheusApi}pinprocessApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus pinprocessApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log(" error in Promethus pinprocessApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    payGCharging(payload)
    {
        const cParty = payload.c_party;
        const uuid = payload.uuid;

        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]payload recieved  for payGCharging API " + JSON.stringify(payload));
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] payGCharging API ==> " + defaultConfig.payGCharging + cParty);


        return axios.post(`${defaultConfig.payGCharging}${payload.cParty}`,
            {
                c_party: cParty,
            },
            {
                httpAgent: keepaliveAgent
            }).then((response) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus chargingpayg  api call => ${defaultConfig.prometheusApi}chargingpayg`);

                axios.get(`${defaultConfig.prometheusApi}chargingpayg`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus chargingpayg api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus chargingpayg api => ", err.message);
                });
                return response.data;
            })
            .catch((error) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus chargingpaygApiNotResponding  api call => ${defaultConfig.prometheusApi}chargingpaygApiNotResponding`);


                axios.get(`${defaultConfig.prometheusApi}chargingpaygApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus chargingpaygApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus chargingpaygApiNotResponding api  => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);

                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });


    }

    routingInfo(payload)
    {

        return new Promise((resolve, reject) => {
            resolve({processCall: "Y"})    
        })

        
        // function for routingInfo api call
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;


        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+uuid+"]payload recieved  " + JSON.stringify(payload));   


        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] routingInfo API called with " + payload.toNumber);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] routingInfo API ==> " + defaultConfig.sendRoutingInfoRequest + "92" + fromNumber + "/92" + toNumber + "/" + referenceNo);

        // imsi:  International Mobile Subscriber Identity,
        // IMSI is an internationally standardized number to identify each mobile subscriber.
        // An IMSI number is generally 15 digits, but they can be shorter.
        // The first three digits are the mobile country code, followed by the mobile network code .
        // The remaining digits are the mobile phone number, generally 9-10 digits in length.

        return axios.get(`${defaultConfig.sendRoutingInfoRequest}92${fromNumber}/92${toNumber}/${referenceNo}`).then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus SendRoutingInfoRequest  api call => ${defaultConfig.prometheusApi}SendRoutingInfoRequest`);
                axios.get(`${defaultConfig.prometheusApi}SendRoutingInfoRequest`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus SendRoutingInfoRequest api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus SendRoutingInfoRequest api => ", err.message);
                });
                if ((response.data.roamingNumber.startsWith("9230")))
                {
                    
                    let data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  routingInfo response :  " + JSON.stringify(data));


                    return {
                        processCall: "Y",
                        imsi: data.imsi
                    };
                }
                else if ((response.data.roamingNumber.startsWith("55993")))
                {
                    let data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  routingInfo response :  " + JSON.stringify(data));
                    return {
                        processCall: "Y",
                        imsi: data.imsi
                    };
                }
                else
                {
                    let data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] user " + payload.toNumber + " not processing with data " + JSON.stringify(data));
                    return {
                        processCall: "N"
                    };
                }
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus SendRoutingInfoRequestApiNotResponding  api call => ${defaultConfig.prometheusApi}SendRoutingInfoRequestApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}SendRoutingInfoRequestApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus SendRoutingInfoRequestApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus SendRoutingInfoRequestApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });
                return new Promise((resolve, reject) =>
                {
                    // var imsii= `41001${toNumber}`;
                    // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ uuid +"] IMSII detached:  " + imsii);          
                    // var obj={ processCall: "Y", imsi:imsii };
                    // resolve(obj)
                    // return { processCall: "Y", imsii:'' };
                    reject(error);
                })
            });
    }


    routingInfoBparty(payload)
    { // function for routingInfo api call b-party
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+uuid+"]payload recieved  " + JSON.stringify(payload));     
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] routingInfo API called with b-party " + payload.toNumber);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] routingInfo API ==> " + defaultConfig.sendRoutingInfoRequest + "/92" + fromNumber + "/92" + toNumber + "/" + referenceNo);
        //imsi:  International Mobile Subscriber Identity,
        // IMSI is an internationally standardized number to identify each mobile subscriber.
        // An IMSI number is generally 15 digits, but they can be shorter.
        // The first three digits are the mobile country code, followed by the mobile network code .
        // The remaining digits are the mobile phone number, generally 9-10 digits in length.
        return axios
            .get(`${defaultConfig.sendRoutingInfoRequest}92${fromNumber}/92${toNumber}/${referenceNo}`)
            .then((response) =>
            {
                if ((response.data.roamingNumber.startsWith("923")))
                {
                    // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ uuid +"] user" + payload.toNumber+"processing");
                    let data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  routingInfo response :  " + JSON.stringify(data));
                    return {
                        processCall: "Y",
                        imsi: data.imsi
                    };
                }
                else
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] user" + payload.toNumber + " not processing");
                    return {
                        processCall: "N"
                    };
                }
            })
            .catch((error) =>
            {
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }


    initialDPRequest(payload)
    { 
        return new Promise((resolve, reject) => {
            resolve({processCall: "Y"})    
        })

        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const imzii = payload.imzii;
        const referenceNo = payload.channelId;


        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] IMSII inside IDP function ==> " + imzii);

        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] initialDPRequest API ==> " + defaultConfig.InitialDPRequest + toNumber + "/" + fromNumber + "/" + imzii + "/" + referenceNo);


        return axios.get(`${defaultConfig.InitialDPRequest}92${toNumber}/92${fromNumber}/${imzii}/${referenceNo}`)
            .then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus initialDpReq  api call => ${defaultConfig.prometheusApi}initialDpReq`);
                axios.get(`${defaultConfig.prometheusApi}initialDpReq`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus initialDpReq api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus initialDpReq api => ", err.message);
                });

                let data = response.data;
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] initialDPRequest API response" + JSON.stringify(data));
                if (data.continueCall)
                {
                    return {
                        processCall: "Y",
                        continueCall: data.continueCall,
                        dialogueId: data.localDialogId
                    };
                }
                else
                {
                    // return { processCall: "N", dialogueId: data.localDialogId };
                    return {
                        processCall: "N",
                        dialogueId: data.localDialogId
                    };
                }
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus initialDpReqApiNotResponding  api call => ${defaultConfig.prometheusApi}initialDpReqApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}initialDpReqApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus initialDpReqApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus initialDpReqApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ uuid +"]  Error ApiNotResponding ==>  "+ error.message);
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    oAnswer(payload)
    { // function for oAnswer api call
        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+"]payload recieved for oAnswer API" + JSON.stringify(payload));
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        const dialogueID = payload.dialogueID;
        const isLandline = payload.isLandline;
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] oAnswer  api call => ${defaultConfig.OAnswer}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`);
        return axios
            .get(`${defaultConfig.OAnswer}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`)
            .then((response) =>
            {
                if (response.data)
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oAnswer  api call => ${defaultConfig.prometheusApi}oAnswer`);
                    axios.get(`${defaultConfig.prometheusApi}oAnswer`,
                    {
                        httpAgent: keepaliveAgent,
                    }).then((response) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus Response => ", response.data);
                    }).catch((err) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oAnswer api => ", err.message);
                    });

                    const data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] oAnswer API response" + JSON.stringify(data));
                    if (data.maxCallPeriodDuration >= 20)
                    {
                        return {
                            processCall: "Y",
                            data: data
                        };
                    }
                    else
                    {
                        return {
                            processCall: "N"
                        };
                    }
                }
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oAnswerApiNotResponding  api call => ${defaultConfig.prometheusApi}oAnswerApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}oAnswerApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus oAnswerApiNotResponding Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oAnswerApiNotResponding api => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus ApiNotResponding Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api => ", err.message);
                });
                // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ uuid +"]  Error ApiNotResponding ==>  "+ error.message);
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }


    async applyChargingReport(payload)
    { // function for applyChargingReport api call
        // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+"]payload recieved for applyChargingReport function" + JSON.stringify(payload)); 
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] applyChargingReport  api call =>  ${defaultConfig.ApplyChargingReport}92${payload.toNumber}/92${payload.fromNumber}/${payload.localDialogueId}/${payload.channelId}/${payload.sequenceNum}/${payload.duration}/${payload.isCall}`);
        let response = await axios.get(` ${defaultConfig.ApplyChargingReport}92${payload.toNumber}/92${payload.fromNumber}/${payload.localDialogueId}/${payload.channelId}/${payload.sequenceNum}/${payload.duration}/${payload.isCall}`)
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] error in ApplyChargingReportApi${error.message}`);
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApplyChargingReportApiNotResponding  api call => ${defaultConfig.prometheusApi}ApplyChargingReportApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApplyChargingReportApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus ApplyChargingReportApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApplyChargingReportApiNotResponding api  => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });
            })

        if (response)
        {
            let data = response.data;
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApplyChargingReport  api call => ${defaultConfig.prometheusApi}ApplyChargingReport`);
            axios.get(`${defaultConfig.prometheusApi}ApplyChargingReport`,
            {
                httpAgent: keepaliveAgent,
            }).then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApplyChargingReport api Response => ", response.data);
            }).catch((err) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApplyChargingReport api => ", err.message);
            });

            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] ApplyChargingReport response ${JSON.stringify(data)}`);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] status ${response.status}`);
            if (data.continueCall)
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ]ApplyChargingReport { processCall: "Y"} ===== ${payload.toNumber}`);
                return {
                    processCall: "Y",
                    data: data,
                    status: response.status
                };
            }
            else
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ]ApplyChargingReport { processCall: "N"} ===== ${payload.toNumber}`);
                return {
                    processCall: "N",
                    status: response.status
                };
            }
        }
        else
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] ApplyChargingReport response ${JSON.stringify(data)}`);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ]ApplyChargingReport { processCall: "N"} ===== ${payload.toNumber}`);
            return {
                processCall: "N",
                status: 400
            };
        }
    }




    oAbandon(payload)
    { // function for oAbandon api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]payload recieved for oAbandon API" + JSON.stringify(payload));
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        const dialogueID = payload.dialogueID;
        // console.log( "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "]+" `${uuid} routingInfo check api call => ${defaultConfig.sendRoutingInfoRequest}92${toNumber}/92${fromNumber}/${referenceNo}`);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] oAbandon API ==> " + defaultConfig.OAbandon + "92" + toNumber + "/92" + fromNumber + "/" + dialogueID + "/" + referenceNo);

        return axios
            .get(`${defaultConfig.OAbandon}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`)
            .then((response) =>
            {
                if (response.data)
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oAbandon  api call => ${defaultConfig.prometheusApi}oAbandon`);
                    axios.get(`${defaultConfig.prometheusApi}oAbandon`,
                    {
                        httpAgent: keepaliveAgent,
                    }).then((response) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus oAbandon api Response => ", response.data);
                    }).catch((err) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oAbandon api => ", err.message);
                    });

                    const data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] OAbandon API response" + JSON.stringify(data));
                    return data;
                }
            })
            .catch((error) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oAbandonApiNotResponding  api call => ${defaultConfig.prometheusApi}oAbandonApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}oAbandonApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus oAbandonApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oAbandonApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    OCalledPartyBusy(payload)
    { 
      // function for OCalledPartyBusy api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]payload recieved for OCalledPartyBusy API" + JSON.stringify(payload));
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        const dialogueID = payload.dialogueID;
        // console.log( "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "]+" `${uuid} routingInfo check api call => ${defaultConfig.sendRoutingInfoRequest}92${toNumber}/92${fromNumber}/${referenceNo}`);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] OCalledPartyBusy API ==> " + defaultConfig.OCalledPartyBusy + "92" + toNumber + "/92" + fromNumber + "/" + dialogueID + "/" + referenceNo);

        return axios
            .get(`${defaultConfig.OCalledPartyBusy}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`)
            .then((response) =>
            {
                if (response.data)
                {

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oCalledPartyBusy  api call => ${defaultConfig.prometheusApi}oCalledPartyBusy`);
                    axios.get(`${defaultConfig.prometheusApi}oCalledPartyBusy`,
                    {
                        httpAgent: keepaliveAgent,
                    }).then((response) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus oCalledPartyBusy api Response => ", response.data);
                    }).catch((err) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oCalledPartyBusy api => ", err.message);
                    });


                    const data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] OCalledPartyBusy API response" + JSON.stringify(data));
                    return data;
                }
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oCalledPartyBusyApiNotResponding  api call => ${defaultConfig.prometheusApi}oCalledPartyBusyApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}oCalledPartyBusyApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus oCalledPartyBusyApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oCalledPartyBusyApiNotResponding api  => ", err.message);
                });

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }


    ONoAnswer(payload)
    { 
        // function for ONoAnswer api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]payload recieved for ONoAnswer API" + JSON.stringify(payload));
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        const dialogueID = payload.dialogueID;
        
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] ONoAnswer API ==> " + defaultConfig.ONoAnswer + "92" + fromNumber + "/92" + toNumber + "/" + dialogueID + "/" + referenceNo);

        return axios
            .get(`${defaultConfig.ONoAnswer}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`)
            .then((response) =>
            {
                if (response.data)
                {

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oNoAnswer  api call => ${defaultConfig.prometheusApi}oNoAnswer`);
                    axios.get(`${defaultConfig.prometheusApi}oNoAnswer`,
                    {
                        httpAgent: keepaliveAgent,
                    }).then((response) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus oNoAnswer api Response => ", response.data);
                    }).catch((err) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oNoAnswer api => ", err.message);
                    });

                    const data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] ONoAnswer API response" + JSON.stringify(data));
                    return data;
                }
            })
            .catch((error) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oNoAnswerApiNotResponding  api call => ${defaultConfig.prometheusApi}oNoAnswerApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}oNoAnswerApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus oNoAnswerApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oNoAnswerApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });
                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

    ODisconnect(payload)
    { 
        // function for ODisconnect api call
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]payload recieved for ODisconnect API" + JSON.stringify(payload));
        const toNumber = payload.toNumber;
        const fromNumber = payload.fromNumber;
        const uuid = payload.uuid;
        const referenceNo = payload.channelId;
        const dialogueID = payload.dialogueID;
        const sequenceNo = payload.sequenceNo;
        const isCall = payload.isCall;
        const timerStartTime = payload.timerStartTime;
        const bPartyCallAttended = payload.bPartyCallAttended;
        const chargeReportCalled = payload.chargeReportCalled;

        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] ODisconnect API ==> " + defaultConfig.ODisconnect + "92" + toNumber + "/92" + fromNumber + "/" + dialogueID + "/" + referenceNo);
        return axios
            .get(`${defaultConfig.ODisconnect}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}`)
            .then((response) =>
            {
                if (response.data)
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oDisconnect  api call => ${defaultConfig.prometheusApi}oDisconnect`);
                    axios.get(`${defaultConfig.prometheusApi}oDisconnect`,
                    {
                        httpAgent: keepaliveAgent,
                    }).then((response) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus oDisconnect api Response => ", response.data);
                    }).catch((err) =>
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oDisconnect api => ", err.message);
                    });
                    const data = response.data;
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] ODisconnect API response" + JSON.stringify(data));

                    // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+uuid+"] b-party hangup res=>"+res);

                    if (chargeReportCalled == 0 && bPartyCallAttended == true)
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] **************************** inside oDisconnect success if  ********************* `);

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] applyChargingReport  api call =>  ${defaultConfig.ApplyChargingReport}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}/${sequenceNo}/${payload.ms}/${0} ************after 0Disconnect success`);

                        axios.get(`${defaultConfig.ApplyChargingReport}92${toNumber}/92${fromNumber}/${dialogueID}/${referenceNo}/${sequenceNo}/${payload.ms}0/${0}`)
                            .then((response) =>
                            {
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `${payload.uuid} prometheus ApplyChargingReport  api call => ${defaultConfig.prometheusApi}ApplyChargingReport`);
                                axios.get(`${defaultConfig.prometheusApi}ApplyChargingReport`,
                                {
                                    httpAgent: keepaliveAgent,
                                }).then((response) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + payload.uuid + "]prometheus ApplyChargingReport api Response => ", response.data);
                                }).catch((err) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + payload.uuid + "] error in Promethus ApplyChargingReport api => ", err.message);
                                });
                                let data = response.data;
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] ApplyChargingReport status ${response.status}`);
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `[ ${payload.uuid} ] ApplyChargingReport response ${JSON.stringify(data)}`);
                            }).catch((error) =>
                            {
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] error in ApplyChargingReportApi${error.message}`);
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApplyChargingReportApiNotResponding  api call => ${defaultConfig.prometheusApi}ApplyChargingReportApiNotResponding`);
                                axios.get(`${defaultConfig.prometheusApi}ApplyChargingReportApiNotResponding`,
                                {
                                    httpAgent: keepaliveAgent,
                                }).then((response) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] prometheus ApplyChargingReportApiNotResponding api Response => ", response.data);
                                }).catch((err) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApplyChargingReportApiNotResponding api  => ", err.message);
                                });

                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                                {
                                    httpAgent: keepaliveAgent,
                                }).then((response) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                                }).catch((err) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                                });
                            })
                    }
                    //  return data;       
                }
            })
            .catch((error) =>
            {

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus oDisconnectApiNotResponding  api call => ${defaultConfig.prometheusApi}oDisconnectApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}oDisconnectApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus oDisconnectApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus oDisconnectApiNotResponding api  => ", err.message);
                });


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid}] prometheus ApiNotResponding  api call => ${defaultConfig.prometheusApi}ApiNotResponding`);
                axios.get(`${defaultConfig.prometheusApi}ApiNotResponding`,
                {
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus ApiNotResponding api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus ApiNotResponding api  => ", err.message);
                });

                return new Promise((resolve, reject) =>
                {
                    reject(error);
                })
            });
    }

}

module.exports = new al();