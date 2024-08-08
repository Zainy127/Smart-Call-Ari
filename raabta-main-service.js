const defaultConfig = require('./config.json');
var client = require("ari-client");
const axios = require("axios");
const uuidv4 = require('uuid').v4;
const url = require("url");
const moment = require('moment');
var ip = require('ip');
const al = require('./al');
const bl = require('./bl');
const
{
    builtinModules
} = require('module');
const
{
    get
} = require('http');
const http = require('http');

let prompts = {
    "1": "party_c_sri_gbl_lbl1",
    "2": "welcome_prompt1",
    "3": "registered_number1",
    "4": "api_failure1",
    "5": "wrong_registered_number1",
    
    "6": "pin_code1",

    "7": "non_subscriber1",

    "8": "raabta_call_limit_exhausted1",
    "9": "smart_call_incorrect_pin_suspension_prompt1",
    "10": "insufficient_balance1",
    "11": "party_b_number1",
    "12": "wrong_pin_code1",
    "13": "wrong_party_b1",
    "14": "waiting_prompts_31",
    "15": "Barred_IR"
};
const raabtaMap = new Map();
const keepaliveAgent = new http.Agent(
{
    keepAlive: true
});

client.connect(defaultConfig.asteriskHost, defaultConfig.asteriskUserName, defaultConfig.asteriskPass, clientLoaded);

function clientLoaded(err, ari)
{
    if (err)
    {
        throw err;
    }

    ari.on("StasisStart", (event, channel) =>
        channelStasisStart(
        {
            event,
            channel,
            ari,
        })
    );

    ari.on("ChannelDtmfReceived", (event, channel) =>
        channelDtmfRecieved(
        {
            event,
            channel,
            ari,
        })
    );

    ari.on("StasisEnd", (event, channel) =>
        channelDestroyed(
        {
            event,
            channel,
            ari,
        })
    );
    ari.removeListener('StasisStart', channelStasisStart)
    ari.removeListener('ChannelDtmfReceived', channelDtmfRecieved)
    ari.removeListener('StasisEnd', channelDestroyed)

    ari.start("vas_v1");
}

function channelStasisStart(payload)
{
    const uuid = uuidv4();


    let
    {
        event,
        channel,
        ari
    } = payload;


    channel.answer();

    console.log("Event.args : ",event.args[0]);

    console.log("Event => ",event);

    if (event.args[0] == 'prefixDial' || event.args[0] == 'ivr_call')
    {
        var incomingNumber = event.channel.caller.number;
    }
    else if (event.args[0] == 'ussd')
    {
        var incomingNumber = event.args[1];
    }


    if (event.args[0] != 'dialed')
    { 
      //dialed channel is handelled in originate function
        raabtaMap.set(incomingNumber,
        {
            "a_party_num": '',
            "b_party_num": '',
            "c_party_num": '',
            "processed_dt": moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA"),
            "uuid": '',
            "callStartTime": '',
            "callEndTime": '',
            "SIP_Incoming_CallID": '',
            "SIP_Outgoing_CallID": '',
            "incoming_channel": '',
            "outgoing_channel": '',
            "incoming_channelID": '',
            "outgoing_channelID": '',
            "channel_bridgedID": '',
            "Media_IP_Addr": '',
            "Call_type": '',
            "status": '',
            "astResponse": '',
            "astResponseTxt": '',
            "outgoing_destroyed": '',
            "incoming_destroyed": '',
            "billingTimer": '',
            "intervalTime": '',
            "hangUpTimer": '',
            "channel2": channel,
            "dtmfEnteredNumber": "",
            "pincode": '',
            "ivrState": '0',
            "intervalID": '',
            "hangupTimeout": '',
            "dataInserted": '0',
            "playTimer": '',
            "b_party_ringing": '',
            "bPartyIsLandlineNumber": false,
            "cPartyIMSII": '',
            "cPartyDialogueId": '',
            "chargingIntervalTime": '',
            "timerHandler": 0,
            "timerStartTime": '',
            "timerStopTime": '',
            "timerCounter": 0,
            "oChargeReport": 0,
            "chargingReport0": 0,
            "b_party_attended_call": false,
            "b_party_mobileNumber_isWrong": false,
            "b_party_counter": 0,
            "c_party_counter": 0,
            "bridgeStartTime": '',
            "failureCause": '',


        });
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] After Allocation of " + incomingNumber + " Map Size is" + raabtaMap.size);
        // channell2 = channel;
        raabtaMap.get(incomingNumber).incoming_channel = channel;
        raabtaMap.get(incomingNumber).Media_IP_Addr = ip.address();
        raabtaMap.get(incomingNumber).callStartTime = moment(Date.now()).format();
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] Media IP Address: " + raabtaMap.get(incomingNumber).Media_IP_Addr + " For " + incomingNumber);
    }

    try
    {
        if (event.args[0] == 'dialed')
        { 
           
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] outgoing call");
            return;
        }
        if (event.args[0] == 'prefixDial')
        {
            var FormattedCellNoAparty = checkEnteredNumber(incomingNumber, incomingNumber, 'aparty');

            console.log("Formatted Cell No A Party : ",FormattedCellNoAparty);


            raabtaMap.get(incomingNumber).a_party_num = FormattedCellNoAparty;
            raabtaMap.get(incomingNumber).uuid = uuid;
            raabtaMap.get(incomingNumber).Call_type = "prefixCall";
            raabtaMap.get(incomingNumber).incoming_channelID = channel.id;



            var FormattedCellNoBparty = checkEnteredNumber(event.args[1], incomingNumber, 'bPartyPrefix')

            console.log("Formatted Cell No B Party : ",FormattedCellNoBparty);

            raabtaMap.get(incomingNumber).b_party_num = FormattedCellNoBparty;

            raabtaMap.get(incomingNumber).hangUpTimer = setTimeout(hangup, 30000, incomingNumber);

            
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Prefix Call From " + raabtaMap.get(incomingNumber).a_party_num + " & B_party is " + raabtaMap.get(incomingNumber).b_party_num);


            al.getGlobalBlacklist(raabtaMap.get(incomingNumber).a_party_num, uuid) .then(function(value){

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] global blacklist api response{status}: " + value.status + "  global blacklist api response{msg} : " + value.msg);

                    console.log("==============");
                    console.log("Value : ",value);
                    console.log("==============");

                    if (value.status == 8)
                    { 
                        raabtaMap.get(incomingNumber).failureCause = 'A_party_Global_Blacklisted';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['1'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + " when a-party is global-blacklisted");
                        bl.insertCdr(raabtaMap.get(incomingNumber))
                    }
                    else if (value.status == 1)
                    { 
                        
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + " when a-party is not global-blacklisted");

                        // INSERT THE CDRS
                        bl.insertCdr(raabtaMap.get(incomingNumber))

                        console.log("_________________________");
                        console.log("Cdr inserted successfully");
                        console.log("_________________________");
                        

                        sleep(1000).then(() =>{


                            if (raabtaMap.get(incomingNumber).incoming_channelID == channel.id)
                            {

                                play(channel, defaultConfig.soundsDirectory + prompts['2'], ari, incomingNumber);

                                raabtaMap.get(incomingNumber).playTimer = setTimeout(playnextsound, "2000");

                                function playnextsound()
                                {
                                    play(channel, defaultConfig.soundsDirectory + prompts['3'], ari, incomingNumber);
                                }


                                let sip_call_id = channel.getChannelVar({
                                        variable: "SIP_HEADER(CALL-ID)"
                                    },function(err, variable){


                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Incoming SIP CALL ID " + JSON.stringify(variable.value) + " For " + incomingNumber),
                                        raabtaMap.get(incomingNumber).SIP_Incoming_CallID = variable.value;

                                        
                                    }).catch((err) =>{
                                        if (raabtaMap.has(incomingNumber))
                                        {
                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] SIP header error ");
                                        }
                                });
                                raabtaMap.get(incomingNumber).ivrState = "1";


                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState);

                            }
                        })


                    }
                    else if (value.status == -100)
                    { 
                        raabtaMap.get(incomingNumber).failureCause = 'Exception_from_GlobalBlacklist_Api';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "********** exception from api globalBlackList ==========>>>" + JSON.stringify(value));

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + " on  exception from global blacklist api");


                        bl.insertCdr(raabtaMap.get(incomingNumber))

                    }
                }).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error GlobalBlacklist ApiNotResponding ==> in stasis start  " + error.message);
                        
                        raabtaMap.get(incomingNumber).failureCause = 'Error_GlobalBlacklist_Api_NotResponding';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + "  on  error from global blacklist api");
                        bl.insertCdr(raabtaMap.get(incomingNumber))
                    }
                });

            return;
        }
        if (event.args[0] == 'ivr_call')
        {
            raabtaMap.get(incomingNumber).incoming_channelID = channel.id;
            raabtaMap.get(incomingNumber).a_party_num = incomingNumber;
            raabtaMap.get(incomingNumber).Call_type = 'ivrCall';
            raabtaMap.get(incomingNumber).uuid = uuid;
            raabtaMap.get(incomingNumber).hangUpTimer = setTimeout(hangup, 30000, incomingNumber);


            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR call From " + raabtaMap.get(incomingNumber).a_party_num);


            al.getGlobalBlacklist(incomingNumber, uuid) 
                .then(function(value)
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] global blacklist api response{status}: " + value.status + "  global blacklist api response{msg} : " + value.msg);

                    if (value.status == 8)
                    { 
                        raabtaMap.get(incomingNumber).failureCause = 'A_party_Global_Blacklisted';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['1'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + " when a-party is global-blacklisted");

                        bl.insertCdr(raabtaMap.get(incomingNumber))
                    }
                    else if (value.status == 1)
                    { 
                        // 0 ==> number is not globalBlacklisted call can be processed further
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + " when a-party is not global-blacklisted");

                        bl.insertCdr(raabtaMap.get(incomingNumber))


                        sleep(1000).then(() =>
                        {
                            if (raabtaMap.get(incomingNumber).incoming_channelID == channel.id)
                            {
                                // play(channel, defaultConfig.soundsDirectory+"welcome_prompt1",ari,incomingNumber);
                                play(channel, defaultConfig.soundsDirectory + prompts['2'], ari, incomingNumber);
                                raabtaMap.get(incomingNumber).playTimer = setTimeout(playnextsound, "2000");

                                function playnextsound()
                                {
                                    // play(channel, defaultConfig.soundsDirectory+"registered_number1",ari,incomingNumber);
                                    play(channel, defaultConfig.soundsDirectory + prompts['3'], ari, incomingNumber);
                                }
                                let sip_call_id = channel.getChannelVar(
                                    {
                                        variable: "SIP_HEADER(CALL-ID)"
                                    },
                                    function(err, variable)
                                    {
                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Incoming SIP CALL ID " + JSON.stringify(variable.value) + " For " + incomingNumber),
                                            raabtaMap.get(incomingNumber).SIP_Incoming_CallID = variable.value;
                                    }).catch((err) =>
                                {
                                    if (raabtaMap.has(incomingNumber))
                                    {
                                        // log(`${uuid}  SIP HEADER ERROR : ${err}`)
                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] SIP header error ");
                                    }
                                });
                                raabtaMap.get(incomingNumber).ivrState = "1";
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState);
                            }
                        })


                    }
                    else if (value.status == -100)
                    { 
                        raabtaMap.get(incomingNumber).failureCause = 'Exception_from_GlobalBlacklist_Api';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "********** exception from api globalBlackList ==========>>>" + JSON.stringify(value));


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + "on exception from  global-blacklist api");


                        bl.insertCdr(raabtaMap.get(incomingNumber))
                    }
                }).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        raabtaMap.get(incomingNumber).failureCause = ' Error_GlobalBlacklist_Api_NotResponding';
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error GlobalBlacklist ApiNotResponding ==>  " + error.message);


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + "on error from  global-blacklist api");

                        
                        bl.insertCdr(raabtaMap.get(incomingNumber))
                        
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                    }
                });
        }
        if (event.args[0] == 'ussd')
        { 
            let incomingChannel = channel;
            raabtaMap.get(incomingNumber).a_party_num = event.args[1] // Sahoolat-Kaar
            raabtaMap.get(incomingNumber).b_party_num = event.args[2]; //Number to be called
            raabtaMap.get(incomingNumber).c_party_num = event.args[3]; // To Be charged and used as CLI for b_party call


            raabtaMap.get(incomingNumber).incoming_channelID = channel.id;


            raabtaMap.get(incomingNumber).uuid = uuid;
            raabtaMap.get(incomingNumber).Call_type = 'ussd_call';

            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Inserting CDR for  " + raabtaMap.get(incomingNumber).a_party_num + "for callType ==> USSD");


            bl.insertCdr(raabtaMap.get(incomingNumber))
            
            raabtaMap.get(incomingNumber).ivrState = "5"; 

            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");
            let sip_call_id = channel.getChannelVar(
                {
                    variable: "SIP_HEADER(CALL-ID)"
                },
                function(err, variable)
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Incoming SIP CALL ID " + JSON.stringify(variable.value) + " For " + incomingNumber),
                        raabtaMap.get(incomingNumber).SIP_Incoming_CallID = variable.value;
                }).catch((err) =>
            {
                if (raabtaMap.has(incomingNumber))
                {
                    log(`${uuid}  SIP HEADER ERROR : ${err}`);
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] SIP header error ");
                }
            });
            originateBparty(incomingNumber, raabtaMap.get(incomingNumber).b_party_num, ari, event, incomingChannel, raabtaMap.get(incomingNumber).c_party_num);
        }
    }
    catch (error)
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] error in stasisStart function  ==> " + error.message);
        raabtaMap.get(incomingNumber).failureCause = 'stasisStartError';
        hangup(incomingNumber);
    }
}

function channelDtmfRecieved(payload)
{

    let{ event , channel, ari } = payload;

    let incomingChannel = channel;
    var incomingNumber = event.channel.caller.number;


    try
    {
        const uuid = raabtaMap.get(incomingNumber).uuid;
        
        clearTimeout(raabtaMap.get(incomingNumber).hangUpTimer);

        var digit = event.digit;

        raabtaMap.get(incomingNumber).dtmfEnteredNumber += digit;

        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] user : " + raabtaMap.get(incomingNumber).a_party_num + " has entered dtmf : " + digit);

        console.log("TOTAL DIGIT ENTERED : ",raabtaMap.get(incomingNumber).dtmfEnteredNumber);

        if (raabtaMap.get(incomingNumber).ivrState == "1" && raabtaMap.get(incomingNumber).dtmfEnteredNumber.length >= 10)
        {
            if (raabtaMap.get(incomingNumber).dtmfEnteredNumber.startsWith("+923"))
            {
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = raabtaMap.get(incomingNumber).dtmfEnteredNumber.substring(3);
            }
            else if (raabtaMap.get(incomingNumber).dtmfEnteredNumber.startsWith("923"))
            {
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = raabtaMap.get(incomingNumber).dtmfEnteredNumber.substring(2);
            }
            else if (raabtaMap.get(incomingNumber).dtmfEnteredNumber.startsWith("00923"))
            {
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = raabtaMap.get(incomingNumber).dtmfEnteredNumber.substring(4);
            }
            else if (raabtaMap.get(incomingNumber).dtmfEnteredNumber.startsWith("03"))
            {
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = raabtaMap.get(incomingNumber).dtmfEnteredNumber.substring(1);
            }
            else if (raabtaMap.get(incomingNumber).dtmfEnteredNumber.startsWith("3"))
            {
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = raabtaMap.get(incomingNumber).dtmfEnteredNumber;
            }
            else
            {
                if (raabtaMap.get(incomingNumber).c_party_counter != 2)
                {

                    
                    play(channel, defaultConfig.soundsDirectory + prompts['5'], ari, incomingNumber);

                    raabtaMap.get(incomingNumber).ivrState = "1";

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + " for entering invalid c-party number");


                    raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                    raabtaMap.get(incomingNumber).c_party_counter++;

                }
                else
                {
                    
                    raabtaMap.get(incomingNumber).failureCause = 'Invalid_Cparty_entered_3_times';
                    playAndHangup(channel, defaultConfig.soundsDirectory + prompts['5'], ari, incomingNumber);


                    raabtaMap.get(incomingNumber).ivrState = "5";

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + " for entering invalid c-party number(3rd attempt). Call Dropper!!!");


                    raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                }
            }

            if (raabtaMap.get(incomingNumber).ivrState == "1" && raabtaMap.get(incomingNumber).dtmfEnteredNumber.length == 10 && raabtaMap.get(incomingNumber).incoming_channelID == channel.id)
            {

                raabtaMap.get(incomingNumber).c_party_num = raabtaMap.get(incomingNumber).dtmfEnteredNumber;

                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] user : " + raabtaMap.get(incomingNumber).a_party_num + " has entered registered number : " + raabtaMap.get(incomingNumber).c_party_num);

                al.getVoiceCallProcessInfo(
                    {
                        fromNumber: raabtaMap.get(incomingNumber).a_party_num,
                        toNumber: raabtaMap.get(incomingNumber).c_party_num,
                        channel: 'ivr',
                        uuid
                    }) 
                    .then(function(value)
                    { 
                        console.log("GET VOICE CALL PROCESS INFO => ",value);

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] getVoiceCallProcessInfo api response{status}: " + value.status + " getVoiceCallProcessInfo api response{msg} : " + value.msg);

                        let status = value.status; 

                        status = 1;

                        if (status == 1)
                        { 
                            // 1 ==>  User has passed all checks and can make a call
                            raabtaMap.get(incomingNumber).ivrState = "2";


                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to : " + raabtaMap.get(incomingNumber).ivrState);

                            raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";
                            
                            play(channel, defaultConfig.soundsDirectory + prompts['6'], ari, incomingNumber);

                            raabtaMap.get(incomingNumber).hangUpTimer = setTimeout(hangup, 30000, incomingNumber);

                        }
                        else if (status == -1)
                        { 
                            // user doesn't exits in DB ( is non subscriber)
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Entered_Cparty_is_not_subscriber';

                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['7'], ari, incomingNumber);


                            raabtaMap.get(incomingNumber).ivrState = "5";

                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                        }
                        else if (status == 0)
                        { 
                            // user  exits in DB( BUT is non subscriber)

                            raabtaMap.get(incomingNumber).failureCause = 'Entered_Cparty_is_not_subscriber';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['7'], ari, incomingNumber);
                            raabtaMap.get(incomingNumber).ivrState = "5"; 

                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                        }
                        else if (status == -4)
                        { 
                            // User has reached max voice call limit
                          
                            raabtaMap.get(incomingNumber).failureCause = 'Voice_Call_limit_exhausted';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['8'], ari, incomingNumber);
                            raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */


                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                        }
                        else if (status == 9)
                        { 
                           // user is Local Blacklisted  
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Entered_Cparty_is_in_localBlacklist';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['1'], ari, incomingNumber);


                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");


                            raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */

                        }
                        else if (status == -3)
                        {  
                            // user is Blocked            
                            
                            raabtaMap.get(incomingNumber).failureCause = 'blocked_reason_Pincode_limit_exhausted';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['9'], ari, incomingNumber);


                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                            raabtaMap.get(incomingNumber).ivrState = "5"; 

                        }
                        else if (status == 8)
                        { 
                            // user is global Blacklisted  
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Entered_Cparty_is_Global_blacklisted';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['1'], ari, incomingNumber);
                            raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */

                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");
                        }
                        else if (status == -100)
                        { 
                           // exception from api
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Exception_from_voiceCallProcessInfo_api';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                            raabtaMap.get(incomingNumber).ivrState = "5"; 

                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");


                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "********** exception from api globalBlackList ==========>>>" + JSON.stringify(value.msg));
                        }
                        else
                        { 
                           // this else will be executed in case of any unexpected response
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Unexpected_response_from_voiceCallProcessInfo_Api';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);


                            raabtaMap.get(incomingNumber).ivrState = "5"; 
                            
                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "********** unexpected response from  getVoiceCallProcessInfo ***********");
                        }
                    }).catch((error) =>
                    {
                        if (raabtaMap.has(incomingNumber))
                        {
                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error getVoiceCallProcessInfo ApiNotResponding ==>  " + error.message);
                            
                            raabtaMap.get(incomingNumber).failureCause = 'Error_voiceCallProcessInfo_Api_notResponding';
                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                        }

                    })
            }
        }

        if (raabtaMap.get(incomingNumber).ivrState == "2" && raabtaMap.get(incomingNumber).dtmfEnteredNumber.length == 4 && raabtaMap.get(incomingNumber).incoming_channelID == channel.id)
        {
            raabtaMap.get(incomingNumber).pincode = raabtaMap.get(incomingNumber).dtmfEnteredNumber;
            raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";


            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] user : " + raabtaMap.get(incomingNumber).a_party_num + " has entered pincode " + raabtaMap.get(incomingNumber).pincode);


            console.log("PIN CODE => ",raabtaMap.get(incomingNumber).pincode);

            al.getPINProcessInfo({
                    toNumber: raabtaMap.get(incomingNumber).c_party_num,
                    fromNumber: raabtaMap.get(incomingNumber).a_party_num,
                    pincode: raabtaMap.get(incomingNumber).pincode,
                    channel: 'ivr',
                    uuid
                }) 
                .then(function(value)
                {

                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] getPINProcessInfo api response{status}: " + value.status + " getPINProcessInfo api response{msg} : " + value.msg);

                    console.log("________________________________________________");
                    console.log("RESPONSE FROM GET PIN PROCESS INFO API => ",value);
                    console.log("________________________________________________");

                    let status = value.status;

                    status = 1;

                    if (status == 1)
                    {
                        // 1 ==>  User has entered correct password
                        if (raabtaMap.get(incomingNumber).Call_type == "prefixCall")
                        { 

                            console.log("IN THE PRFEIX CALL ==========================>");

                            // callType is checked, in case of prefixCall, user will not be prompted to enter b-party number
                            al.routingInfo({
                                    fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                                    toNumber: raabtaMap.get(incomingNumber).c_party_num,
                                    channelId: channel.id,
                                    uuid: raabtaMap.get(incomingNumber).uuid
                                }) 
                                .then((value) =>
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] response from routing info function(c-party):  " + JSON.stringify(value));

                                    console.log("ROUTING INFO RESULT ==> ",value);

                                    if (value.processCall == 'Y')
                                    {
                                        
                                        raabtaMap.get(incomingNumber).cPartyIMSII = value.imsi;

                                        al.initialDPRequest({
                                                fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                                                toNumber: raabtaMap.get(incomingNumber).c_party_num,
                                                channelId: channel.id,
                                                uuid,
                                                imzii: raabtaMap.get(incomingNumber).cPartyIMSII
                                            }) 
                                            .then((value) =>
                                            {
                                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] response from initialDPrequest function(c-party):  " + JSON.stringify(value));

                                                console.log("________________________________________");
                                                console.log("VALUE FROM INITIAL DP REQUEST ==> ",value);
                                                console.log("________________________________________");


                                                if (value.processCall == 'Y')
                                                {                    
                                                    raabtaMap.get(incomingNumber).cPartyDialogueId = value.dialogueId;


                                                    originateBparty(incomingNumber, raabtaMap.get(incomingNumber).b_party_num, ari, event, incomingChannel, raabtaMap.get(incomingNumber).c_party_num); //call is originated to b-party 

                                                    raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";
                                                    raabtaMap.get(incomingNumber).ivrState = "5"; 

                                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");
                                                }
                                                else
                                                {
                                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  " + " call cannot be processed further IDP function response: N");

                                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + `${uuid} ] prometheus lowBalance  api call => ${defaultConfig.prometheusApi}lowBalance`);

                                                    axios.get(`${defaultConfig.prometheusApi}lowBalance`,
                                                    {
                                                        httpAgent: keepaliveAgent,
                                                    }).then((response) =>
                                                    {
                                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus lowBalance api Response => ", response.data);
                                                    }).catch((err) =>
                                                    {
                                                        if (map1.has(incomingNumber))
                                                        {
                                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus lowBalance api => ", err.message);
                                                        }
                                                    });

                                                    
                                                    raabtaMap.get(incomingNumber).failureCause = 'IDP_response_continueCall_false_lowBalance';
                                                    playAndHangup(channel, defaultConfig.soundsDirectory + prompts['10'], ari, incomingNumber);

                                                }
                                            }).catch((error) =>
                                            {
                                                if (raabtaMap.has(incomingNumber))
                                                {
                                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error initialDPRequest(c-party) ApiNotResponding ==> " + error.message);
                                                    
                                                    raabtaMap.get(incomingNumber).failureCause = 'Error_IDP_Api_notResponding';
                                                    playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                                                }
                                            })

                                    }
                                    else
                                    {
                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  " + " call cannot be processed further because C-party is IR user");
                                        
                                        raabtaMap.get(incomingNumber).failureCause = 'C_party_IR_User';
                                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['15'], ari, incomingNumber);
                                    }
                                }).catch(error =>
                                {
                                    if (raabtaMap.has(incomingNumber))
                                    {
                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error sendRoutingInfo(c-party) ApiNotResponding ==> " + error.message);
                                        
                                        raabtaMap.get(incomingNumber).failureCause = 'Error_SRI_Api_notResponding';
                                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                                    }
                                })
                        }
                        else if (raabtaMap.get(incomingNumber).Call_type == "ivrCall")
                        { 
                            // in case of ivr-call, a-party will be prompted to enter b-party number
                            
                            play(channel, defaultConfig.soundsDirectory + prompts['11'], ari, incomingNumber);
                            raabtaMap.get(incomingNumber).ivrState = "3";
                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState);
                            raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";
                        }
                    }
                    else if (status == -1)
                    { 
                        // -1 ==> The user isn't subscribed
                        
                        raabtaMap.get(incomingNumber).failureCause = 'C_party_is_non_subscriber';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['7'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5";

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                    }
                    else if (status == -2)
                    { 
                        // -2 ==> User has entered incorrect password
                        
                        play(channel, defaultConfig.soundsDirectory + prompts['12'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "2";
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState);
                        raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";
                    }
                    else if (status == -3)
                    { 
                        // -3 ==> User has exhausted their limit
                        
                        raabtaMap.get(incomingNumber).failureCause = 'Pincode_limit_exhausted';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['12'], ari, incomingNumber);

                        raabtaMap.get(incomingNumber).ivrState = "5"; 


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");

                    }
                    else if (status == -100)
                    { 
                        // -100 ==> exception from api        
                        
                        raabtaMap.get(incomingNumber).failureCause = 'Exception_from_pinProcess_Api';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "5"; /* free state */


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "********** exception from api pinProcess ==========>>>" + JSON.stringify(value));
                    }
                }).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error PINProcess ApiNotResponding ==> " + error.message);
                        
                        raabtaMap.get(incomingNumber).failureCause = 'Error_pinProcess_Api_notResponding';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                    }
                });
        }

        if (raabtaMap.get(incomingNumber).ivrState == "3" && digit == '#')
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state on entering B-party dtmf =" + raabtaMap.get(incomingNumber).ivrState);


            var enteredNum = raabtaMap.get(incomingNumber).dtmfEnteredNumber;
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  dtmfEnteredNumber  ==> " + raabtaMap.get(incomingNumber).dtmfEnteredNumber);
            var cellNo = enteredNum.substr(0, enteredNum.toString().length - 1);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  cellNo variable is  ==> " + cellNo);

            var FormattedCellNo = checkEnteredNumber(cellNo, incomingNumber, 'bparty')

            if (raabtaMap.get(incomingNumber).ivrState == "3" && raabtaMap.get(incomingNumber).incoming_channelID == channel.id)
            {
                raabtaMap.get(incomingNumber).b_party_num = FormattedCellNo; // 
                raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                if (!raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong)
                {
                    al.routingInfo({
                            fromNumber: raabtaMap.get(incomingNumber).a_party_num,
                            toNumber: raabtaMap.get(incomingNumber).c_party_num,
                            channelId: channel.id,
                            uuid: raabtaMap.get(incomingNumber).uuid
                        }) 
                        .then((value) =>
                        {
                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] response from routing info function(c-party):  " + JSON.stringify(value));
                            if (value.processCall == 'Y')
                            { 
                                // Y ==> c-party is not IR number & call can be processed further             
                                raabtaMap.get(incomingNumber).cPartyIMSII = value.imsi;

                                al.initialDPRequest(
                                    {
                                        toNumber: raabtaMap.get(incomingNumber).c_party_num,
                                        fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                                        channelId: channel.id,
                                        uuid: raabtaMap.get(incomingNumber).uuid,
                                        imzii: raabtaMap.get(incomingNumber).cPartyIMSII
                                    }) //IDP api call for c-party
                                    .then((value) =>{
                                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] response from initialDPrequest function(c-party):  " + JSON.stringify(value));


                                        if (value.processCall == 'Y')
                                        { 
                                            // Y ==> call can be processed further                    
                                            raabtaMap.get(incomingNumber).cPartyDialogueId = value.dialogueId;
                                            originateBparty(incomingNumber, raabtaMap.get(incomingNumber).b_party_num, ari, event, incomingChannel, raabtaMap.get(incomingNumber).c_party_num); //call is originated to b-party

                                            raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                                            raabtaMap.get(incomingNumber).ivrState = "5";

                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + "(free state)");
                                        }
                                        else
                                        {
                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  " + " call cannot be processed further IDP function response: N");


                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [ " + `${uuid} ] prometheus lowBalance  api call => ${defaultConfig.prometheusApi}lowBalance    `);

                                            axios.get(`${defaultConfig.prometheusApi}lowBalance`,{
                                                httpAgent: keepaliveAgent,
                                            }).then((response) =>
                                            {
                                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]prometheus lowBalance api Response => ", response.data);
                                            }).catch((err) =>
                                            {
                                                if (map1.has(incomingNumber))
                                                {
                                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] error in Promethus lowBalance api => ", err.message);
                                                }
                                            });
                                            
                                            raabtaMap.get(incomingNumber).failureCause = 'IDP_response_continueCall_false_lowBalance';
                                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['10'], ari, incomingNumber);
                                        }
                                    }).catch((error) =>
                                    {
                                        if (raabtaMap.has(incomingNumber))
                                        {
                                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error initialDPRequest(c-party) ApiNotResponding ==> " + error.message);

                                            
                                            raabtaMap.get(incomingNumber).failureCause = 'Error_IDP_Api_notResponding';
                                            playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                                        }
                                    })
                            }
                            else
                            {
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  " + " call cannot be processed further because C-party is IR user");
                                
                                raabtaMap.get(incomingNumber).failureCause = 'C_party_IR_User';
                                playAndHangup(channel, defaultConfig.soundsDirectory + prompts['15'], ari, incomingNumber);
                            }
                        }).catch(error =>
                        {
                            if (raabtaMap.has(incomingNumber))
                            {
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error sendRoutingInfo(c-party) ApiNotResponding ==> " + error.message);
                                
                                raabtaMap.get(incomingNumber).failureCause = 'Error_SRI_Api_notResponding';
                                playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                            }
                        })

                }
                else
                {
                    if (raabtaMap.get(incomingNumber).b_party_counter != 2)
                    {
                        raabtaMap.get(incomingNumber).b_party_counter++;
                        raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong = false;


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Wrong format b-party entered  ==> " + raabtaMap.get(incomingNumber).b_party_num);

                        // play(channel, defaultConfig.soundsDirectory+"wrong_party_b1",ari,incomingNumber);
                        play(channel, defaultConfig.soundsDirectory + prompts['13'], ari, incomingNumber);
                        raabtaMap.get(incomingNumber).ivrState = "3";
                        raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + " for entering b-party again");
                    }
                    else
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Wrong format b-party entered(3rd attempt) ==> " + raabtaMap.get(incomingNumber).b_party_num);
                        
                        raabtaMap.get(incomingNumber).failureCause = 'wrong_Bparty_Entered_3_times';
                        playAndHangup(channel, defaultConfig.soundsDirectory + prompts['13'], ari, incomingNumber);

                        raabtaMap.get(incomingNumber).ivrState = "5";
                        raabtaMap.get(incomingNumber).dtmfEnteredNumber = "";

                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] IVR_state set to :" + raabtaMap.get(incomingNumber).ivrState + " for entering b-party again. Call Dropped!!!");

                    }
                }
            }
        }
    }
    catch (error)
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] error in channelDtmfRecieved function  ==> " + error.message);
        hangup(incomingNumber);
    }

}

function play(channel, sound, ari, incomingNumber, callback)
{
    var playback = ari.Playback();


    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] " + sound + " Played for = " + incomingNumber);


    playback.once("PlaybackFinished", function(event, instance){
        if (callback)
        {
            callback(null);
        }
    });


    channel.play({
        media: sound
    }, playback, function(err, playback) {});
}

const playAndHangup = async (channel, sound, ari, incomingNumber) =>
{
    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] " + sound + " Played for = " + incomingNumber);
    let playback = ari.Playback();


    await channel.play(
    {
        media: sound
    }, playback).catch(async (err) =>
    { 
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]error in playing sound: " + sound + " for " + incomingNumber + " error => " + err.message);
        
    });


    playback.once(`PlaybackFinished`, async (event, playbackFinished) =>
    { 
        // when playback is finished, this block will be called
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback id:" + playbackFinished.id);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback media_uri:" + playbackFinished.media_uri);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback next_media_uri:" + playbackFinished.next_media_uri);


        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback target_uri:" + playbackFinished.target_uri);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback language:" + playbackFinished.language);
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]finished playback state:" + playbackFinished.state);

        // await sleep(waitTime);
        if (channel && playbackFinished.state !== 'failed')
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Hanging Up after playing:" + playbackFinished.media_uri);
            hangup(incomingNumber);
        }
    });
}



function checkEnteredNumber(cellno, incomingNumber, party)
{ 
    if (party == 'aparty')
    {

    }
    else
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] User : " + incomingNumber + " Entered B_party number is: " + cellno)
    }


    if (cellno.startsWith("+923"))
    {
        cellno = cellno.substring(3)
        console.log(cellno)
        checkEnteredNumber(cellno, incomingNumber)
    }
    else if (cellno.startsWith("923"))
    {
        cellno = cellno.substring(2)
        // console.log(cellno)
        checkEnteredNumber(cellno, incomingNumber)
    }
    else if (cellno.startsWith("00923"))
    {
        cellno = cellno.substring(4)
        
        checkEnteredNumber(cellno, incomingNumber)
    }
    else if (cellno.startsWith("03"))
    {
        cellno = cellno.substring(1)
        // console.log(cellno)
    }
    else if (cellno.startsWith("3"))
    {
        cellno = cellno
        // console.log(cellno)
    }
    else
    {
        if (cellno.startsWith("0"))
        {
            cellno = cellno.substring(1)
            // console.log(cellno)
            raabtaMap.get(incomingNumber).bPartyIsLandlineNumber = true;
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] User : " + incomingNumber + " Entered Landline number: " + cellno)
        }
        else
        {
            // cellno = cellno
            if (party == 'bparty')
            {
                raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong = true;
                cellno = cellno;
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] User : " + incomingNumber + " Entered wrong b-party number: " + cellno)
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong : " + raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong)
            }
            if (party == 'bPartyPrefix')
            {
                raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong = true;
                cellno = 'notValid';
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] User : " + incomingNumber + " Entered wrong b-party number: " + cellno)
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  raabtaMap.get(incomingNumber).b_party is Wrong : " + raabtaMap.get(incomingNumber).b_party_mobileNumber_isWrong)
            }

        }
        // raabtaMap.get(incomingNumber).bPartyIsLandlineNumber=true;
        // console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ raabtaMap.get(incomingNumber).uuid+"] User : "+incomingNumber+" Entered Landline number: "+ cellno)
        //
    }
    return cellno;
}

function hangup(incomingNumber)
{
    var channel = raabtaMap.get(incomingNumber).channel2;
    channel.hangup(function(err) {});
}


function hangupOutgoing(incomingNumber)
{
    var channel = raabtaMap.get(incomingNumber).outgoing_channel;
    channel.hangup(function(err) {});
}

function deleteMap(incomingNumber)
{
    clearTimeout(raabtaMap.get(incomingNumber).hangupTimeout);
    clearTimeout(raabtaMap.get(incomingNumber).hangUpTimer)
    raabtaMap.delete(incomingNumber)
    console.log("After deletion Map Size is : " + raabtaMap.size)
}


function channelDestroyed(payload)
{
    let
    {
        event,
        channel,
        ari
    } = payload;
    var incomingNumber = event.channel.caller.number;

    if (raabtaMap.has(incomingNumber))
    {
        clearTimeout(raabtaMap.get(incomingNumber).hangUpTimer)
        clearTimeout(raabtaMap.get(incomingNumber).hangupTimeout);
        clearTimeout(raabtaMap.get(incomingNumber).playTimer);

        var originatedChannel = raabtaMap.get(incomingNumber).outgoing_channel;
        raabtaMap.get(incomingNumber).incoming_destroyed = moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA");
        clearInterval(raabtaMap.get(incomingNumber).intervalID);


        if (raabtaMap.get(incomingNumber).channel_bridgedID != '')
        {

            const timerStopTime = moment().format(`HH:mm:ss`);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  hangup chargingReport0: " + raabtaMap.get(incomingNumber).chargingReport0);

            let res = moment.utc(moment(timerStopTime, "HH:mm:ss").diff(moment(raabtaMap.get(incomingNumber).timerStartTime, "HH:mm:ss"))).format("HH:mm:ss");
            let ms = moment(res, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds');


            if (ms > 3600)
            {
                ms = 60;
            }
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Odisconnect res=>" + res);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Odisconnect ms=>" + ms);
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Odisconnect=> ms:::::: " + `${ms}0===== typeof ${typeof ms} `);

            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] EventReportBCSMRequestODisconnect");
            al.ODisconnect(
                {
                    toNumber: raabtaMap.get(incomingNumber).c_party_num,
                    fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                    channelId: originatedChannel.id,
                    uuid: raabtaMap.get(incomingNumber).uuid,
                    dialogueID: raabtaMap.get(incomingNumber).cPartyDialogueId,
                    sequenceNo: raabtaMap.get(incomingNumber).timerCounter,
                    iscall: 1,
                    timerStartTime: raabtaMap.get(incomingNumber).timerStartTime,
                    bPartyCallAttended: raabtaMap.get(incomingNumber).b_party_attended_call,
                    chargeReportCalled: raabtaMap.get(incomingNumber).chargingReport0,
                    ms: ms
                })
                .then((response) =>
                {}).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]  Error oDisconnect ApiNotResponding ==>  " + error.message);
                    }
                })
        }

        if (raabtaMap.get(incomingNumber).b_party_ringing == '0')
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] EventReportBCSMRequestOAbandon");
            al.oAbandon(
                {
                    toNumber: raabtaMap.get(incomingNumber).c_party_num,
                    fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                    channelId: originatedChannel.id,
                    uuid: raabtaMap.get(incomingNumber).uuid,
                    dialogueID: raabtaMap.get(incomingNumber).cPartyDialogueId
                })
                .then((response) =>
                {}).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]  Error oAbandon ApiNotResponding ==>  " + error.message);
                    }
                })
        }
        if (raabtaMap.get(incomingNumber).outgoing_channel !== '')
        {
            originatedChannel.hangup(function(err)
            {
                if (raabtaMap.get(incomingNumber))
                {
                    raabtaMap.get(incomingNumber).callEndTime = moment(Date.now()).format();
                    
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Updating CDR's on a-party hangup");

                    bl.updateCdrOnHangup(raabtaMap.get(incomingNumber));
                    deleteMap(incomingNumber);
                    
                }
                
            });

        }
        else
        {
            raabtaMap.get(incomingNumber).callEndTime = moment(Date.now()).format();
            
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Updating CDR's on a-party hangup");
            bl.updateCdrOnHangup(raabtaMap.get(incomingNumber));
            deleteMap(incomingNumber);
        }


    }
}


function originateBparty(incomingNumber, b_party, ari, event, incomingChannel, subscriberNumber)
{
    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] inside originate function");

    //play(incomingChannel, defaultConfig.soundsDirectory+"waiting_prompts_31",ari,incomingNumber);
    play(incomingChannel, defaultConfig.soundsDirectory + prompts['14'], ari, incomingNumber);
    
    var incomingNumber = incomingNumber;
    var incomingChannel1 = incomingChannel;
    var event1 = event;
    var ChannelUniqueId = b_party + raabtaMap.get(incomingNumber).uuid;
    ari.channels
        .originateWithId(
        {
            channelId: ChannelUniqueId,
            // endpoint: `SIP/asterisk2/${0}${b_party}`,
            endpoint: `SIP/${defaultConfig.trunkName}/${92}${b_party}`,
            callerId: subscriberNumber,
            appArgs: "dialed",
            app: "IVR",
        })
        .then(function(channel)
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] call originated to b-party: 92" + b_party + " With CLI : " + subscriberNumber);

            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `${raabtaMap.get(incomingNumber).uuid} prometheus CallGenratedtoBParty  api call => ${defaultConfig.prometheusApi}CallGenratedtoBParty`);
            axios.get(`${defaultConfig.prometheusApi}CallGenratedtoBParty`,
            {
                httpAgent: keepaliveAgent,
            }).then((response) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "][" + raabtaMap.get(incomingNumber).uuid + "] prometheus CallGenratedtoBParty api Response => ", response.data);
            }).catch((err) =>
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] error in Promethus CallGenratedtoBParty api => ", err.message);
            });

            var originatedChannel = channel;
            var map = raabtaMap.get(incomingNumber)
            raabtaMap.get(incomingNumber).outgoing_channel = channel;
            raabtaMap.get(incomingNumber).outgoing_channelID = channel.id;
            channel.on("StasisStart", (event, channel) => channelStatisStart(
            {
                event1,
                incomingChannel1,
                originatedChannel,
                channel,
                ari,
                incomingNumber,
                b_party
            }));
            channel.on('ChannelStateChange', (event, channel) => ChannelStateChange(
            {
                event1,
                incomingChannel1,
                originatedChannel,
                channel,
                ari,
                incomingNumber,
                b_party
            }))
            channel.on("ChannelHangupRequest", (event, channel) => ChannelHangupRequest(
            {
                event,
                channel,
                ari,
                map,
                incomingNumber,
                b_party
            }));
            channel.on("ChannelDestroyed", (event, channel) => channelDestroyed2(
            {
                event,
                channel,
                ari,
                map,
                incomingNumber,
                incomingChannel1
            }));

            channel.removeListener('StasisStart', channelStatisStart)
            channel.removeListener('ChannelStateChange', ChannelStateChange)
            channel.removeListener('ChannelHangupRequest', ChannelHangupRequest)
            channel.removeListener('ChannelDestroyed', channelDestroyed2)
        })
        .catch(function(err)
        {
            if (raabtaMap.has(incomingNumber))
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Originate Error " + err.message);
                raabtaMap.get(incomingNumber).failureCause = 'Error_in_Call_Origination';


                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] " + `${raabtaMap.get(incomingNumber).uuid} prometheus callOriginationToBpartyFailed  api call => ${defaultConfig.prometheusApi}callOriginationToBpartyFailed`);


                axios.get(`${defaultConfig.prometheusApi}callOriginationToBpartyFailed`,{
                    httpAgent: keepaliveAgent,
                }).then((response) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "][" + raabtaMap.get(incomingNumber).uuid + "]prometheus callOriginationToBpartyFailed api Response => ", response.data);
                }).catch((err) =>
                {
                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "][" + raabtaMap.get(incomingNumber).uuid + "] error in Promethus callOriginationToBpartyFailed api  => ", err.message);
                });
                playAndHangup(channel, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
            }
        });
}

function channelStatisStart(payload)
{
    let
    {
        event1,
        incomingChannel1,
        originatedChannel,
        channel,
        ari,
        incomingNumber,
        b_party
    } = payload
    let sip_call_id = channel.getChannelVar(
        {
            variable: "SIP_HEADER(CALL-ID)"
        },
        function(err, variable)
        {
            // log("SIP CALL ID "+JSON.stringify(variable.value)),
            raabtaMap.get(incomingNumber).SIP_Outgoing_CallID = variable.value;
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Outgoing SIP CALL ID " + raabtaMap.get(incomingNumber).SIP_Outgoing_CallID);
        }).catch((err) =>
    {
        if (raabtaMap.has(incomingNumber))
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  SIP HEADER ERROR : " + err)
        }
    });
}

function ChannelStateChange(payload)
{
    let
    {
        event1,
        incomingChannel1,
        originatedChannel,
        channel,
        ari,
        incomingNumber,
        b_party
    } = payload;
    var state = channel.state;
    if (state == "Ringing")
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] State Changed for " + b_party + " = " + channel.state)
        raabtaMap.get(incomingNumber).b_party_ringing = 1;
    }
    else if (state == "Up")
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] State Changed for " + b_party + " = " + channel.state);
        raabtaMap.get(incomingNumber).b_party_ringing = 2;
        joinMixingBridge(incomingChannel1, originatedChannel, ari, event1, incomingNumber); //both channels are bridged after state of originated channel is UP
    }
}

function ChannelHangupRequest(payload)
{
    let
    {
        event,
        channel,
        ari,
        map,
        incomingNumber,
        b_party
    } = payload;
    if (raabtaMap.has(incomingNumber))
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] HangUp request for " + b_party)

    }
}

function channelDestroyed2(payload)
{
    let
    {
        event,
        channel,
        ari,
        map,
        incomingNumber,
        incomingChannel1
    } = payload;
    map.timerHandler = 1;
   
    if (raabtaMap.has(incomingNumber))
    {
        map.callEndTime = moment(Date.now()).format();
        map.astResponse = event.cause;
        map.astResponseTxt = event.cause_txt;
        if (map.astResponse == 17)
        {
            // EventReportBCSMRequestOCalledPartyBusy 
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] EventReportBCSMRequestOCalledPartyBusy");
            al.OCalledPartyBusy(
                {
                    toNumber: map.c_party_num,
                    fromNumber: map.b_party_num,
                    channelId: channel.id,
                    uuid: map.uuid,
                    dialogueID: map.cPartyDialogueId
                })
                .then((response) =>
                {

                }).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "]  Error oCalledPartybusy ApiNotResponding ==>  " + error.message);
                    }
                })
        }
        if (raabtaMap.get(incomingNumber).b_party_ringing == 1)
        {
            // EventReportBCSMRequestONoAnswer 
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] EventReportBCSMRequestONoAnswer");
            al.ONoAnswer(
                {
                    toNumber: map.c_party_num,
                    fromNumber: map.b_party_num,
                    channelId: channel.id,
                    uuid: map.uuid,
                    dialogueID: map.cPartyDialogueId
                })
                .then((response) =>
                {

                }).catch((error) =>
                {
                    if (raabtaMap.has(incomingNumber))
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  Error oNoAnswer ApiNotResponding ==>  " + error.message);
                    }
                })
        }
    }

    incomingChannel1.hangup(function(err)
    { //a-party will also hangup when b-partry hangs up the call
        if (raabtaMap.has(incomingNumber))
        {
            if (raabtaMap.get(incomingNumber).channel_bridgedID !== '')
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] b-party : " + raabtaMap.get(incomingNumber).a_party_num + " Hanged Up");
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Updating CDR's on b-party hangup");
            }
            else
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Updating CDR's on originated channel destruction");
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] originated channel : " + raabtaMap.get(incomingNumber).outgoing_channelID + " destroyed");
            }
            raabtaMap.get(incomingNumber).callEndTime = moment(Date.now()).format();
            // console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ raabtaMap.get(incomingNumber).uuid+"] insertCDR on b-party hangup");         
            bl.updateCdrOnHangup(raabtaMap.get(incomingNumber));
            deleteMap(map.a_party_num);
            // insertCdr(raabtaMap.get(incomingNumber))
        }
    })

    // console.log(map)
}

function joinMixingBridge(incomingChannel1, originatedChannel, ari, event, incomingNumber)
{
    if (raabtaMap.has(incomingNumber))
    {
        channell2 = originatedChannel;
        var bridge = ari.Bridge();
        originatedChannel.on("StasisEnd", function(event, originatedChannel)
        {
            if (raabtaMap.has(incomingNumber))
            {
                raabtaMap.get(incomingNumber).outgoing_destroyed = moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA");
                if (raabtaMap.get(incomingNumber).channel_bridgedID !== '')
                {
                    dialedExit(originatedChannel, bridge, incomingNumber);
                }
            }

            clearInterval(raabtaMap.get(incomingNumber).intervalID);
        });
        // originatedChannel.answer(function (err) {
        //   if (err) {
        //     throw err;
        //   }
        // });
        bridge.create(
        {
            type: "mixing"
        }, function(err, bridge)
        {
            if (err)
            {
                throw err;
            }
            raabtaMap.get(incomingNumber).channel_bridgedID = bridge.id;
            addChannelsToBridge(incomingChannel1, originatedChannel, bridge, incomingNumber, ari);
        });
    }
}

function dialedExit(originatedChannel, bridge, incomingNumber)
{
    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] a-party : " + raabtaMap.get(incomingNumber).a_party_num + " Hanged Up");
    bridge.destroy(function(err)
    {
        if (err)
        {
            throw err;
        }
        else
        {
            if (raabtaMap.get(incomingNumber))
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Bridge " + bridge.id + " Destroyed");
            }
            
        }
    });
}


function addChannelsToBridge(incomingChannel1, originatedChannel, bridge, incomingNumber, ari)
{ 
    raabtaMap.get(incomingNumber).callStartTime = moment(Date.now()).format();
    
    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] EventReportBCSMRequestOAnswer");


    al.oAnswer(
        {
            toNumber: raabtaMap.get(incomingNumber).c_party_num,
            fromNumber: raabtaMap.get(incomingNumber).b_party_num,
            channelId: originatedChannel.id,
            uuid: raabtaMap.get(incomingNumber).uuid,
            dialogueID: raabtaMap.get(incomingNumber).cPartyDialogueId,
            isLandline: raabtaMap.get(incomingNumber).bPartyIsLandlineNumber
        }) //OAnswer api call for c-party
        .then((value) =>
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] response oAnswer function:  " + JSON.stringify(value));
            if (value.processCall == "Y")
            {
                bridge.addChannel(
                {
                    channel: [originatedChannel.id, incomingChannel1.id]
                }, function(err)
                {
                    if (err)
                    {
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]   bridge error " + err.message);
                        raabtaMap.get(incomingNumber).failureCause = 'Error_in_Call_bridging';
                        throw err;
                    }
                    else
                    {
                        raabtaMap.get(incomingNumber).bridgeStartTime = moment(Date.now()).format();
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Updating CDR's after Bridging both parties");
                        bl.updateCdrAfterBridging(raabtaMap.get(incomingNumber)); // Update CDR's when channels bridged

                        originatedChannel.answer(function(err)
                        {
                            if (err)
                            {
                                throw err;
                            }
                        });


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] Both Numbers Joined the Bridge " + raabtaMap.get(incomingNumber).a_party_num + " <===> " + raabtaMap.get(incomingNumber).b_party_num + " Bridge ID is " + bridge.id)


                        raabtaMap.get(incomingNumber).b_party_attended_call = true;


                        // y means c-party has sufficient balance & call can be processed further.
                        al.updateVoiceCallCounter(raabtaMap.get(incomingNumber).c_party_num, raabtaMap.get(incomingNumber).uuid)
                            .then(function(value)
                            {
                                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] updateVoiceCallCounter api response{status}: " + value.status + " updateVoiceCallCounter api response{msg} : " + value.msg);
                                // console.log("status:"+value.status);
                            }).catch((error) =>
                            {
                                if (raabtaMap.has(incomingNumber))
                                {
                                    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "]  Error updateVoiceCallCounter ApiNotResponding ==> " + error.message);
                                    //  play(incomingChannel1, defaultConfig.soundsDirectory+"api_failure1",ari,incomingNumber);
                                    //  raabtaMap.get(incomingNumber).hangupTimeout=setTimeout(hangup,8000,incomingNumber);
                                    raabtaMap.get(incomingNumber).failureCause = 'Error_updateVoiceCallCounter_Api_notResponding';
                                    playAndHangup(incomingChannel1, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
                                }
                            });
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] call is answered ");
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] max call period duration is: " + value.data.maxCallPeriodDuration);

                        let time = (value.data.maxCallPeriodDuration - defaultConfig.chargeIntervalTime) * 100; //time duration in seconds is calculated for which call is allowed
                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] timer duration  is: " + time);


                        raabtaMap.get(incomingNumber).chargeIntervalTime = time; // time is set to run the interval i.e billingTimer


                        let counter = 0;

                        raabtaMap.get(incomingNumber).timerHandler = 0; //this variable is 0 because call is not dropped yet.      
                        raabtaMap.get(incomingNumber).timerStartTime = moment().format(`HH:mm:ss`);
                        raabtaMap.get(incomingNumber).timerCounter = 0;


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] chargeIntervalTime is: " + raabtaMap.get(incomingNumber).chargeIntervalTime);


                        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] chargeInterval timerStartTime is: " + raabtaMap.get(incomingNumber).timerStartTime);

                        raabtaMap.get(incomingNumber).intervalID = setInterval(async function()
                        {
                            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + "] *************  inside charging interval ********** ");
                            ++counter;

                            raabtaMap.get(incomingNumber).timerCounter = counter; // counter of the times =>billing timer interval is executed
                            raabtaMap.get(incomingNumber).oChargeReport = counter; // counter of the oChargeReport api calls
                            raabtaMap.get(incomingNumber).timerStopTime = moment().format(`HH:mm:ss`); // stop time of the interval in case it stops further


                            let res = moment.utc(moment(raabtaMap.get(incomingNumber).timerStopTime, "HH:mm:ss").diff(moment(raabtaMap.get(incomingNumber).timerStartTime, "HH:mm:ss"))).format("HH:mm:ss"); //time in milliseconds retrieved for which interval is executed everytime


                            let ms = moment(res, 'HH:mm:ss').diff(moment().startOf('day'), 'seconds'); //time in seconds from start of the day


                            console.log(`[${moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA")}] [ ${raabtaMap.get(incomingNumber).uuid }] startCharging chargingTimer => ms ::::: ${ms}0 ===== typeof ${typeof ms} ===== timerStopTime ${ raabtaMap.get(incomingNumber).timerStopTime} ===== timerStartTime ${ raabtaMap.get(incomingNumber).timerStartTime} `);


                            if (raabtaMap.get(incomingNumber).timerHandler)
                            { 
                                // if value of timehandler is set means the channel is hanged up. timehandler is set in channelDestroyed2 function
                                // log(`${uuid} ${userData.timerhandler}  clearing timer`);
                                console.log(`[${moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA")}] [ ${raabtaMap.get(incomingNumber).uuid }] ${raabtaMap.get(incomingNumber).timerHandler} clearing timer `);
                                hangup(incomingNumber);
                            }
                            console.log(`[${moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA")}] [ ${raabtaMap.get(incomingNumber).uuid }] @============== startCharging ochargingReport called ==============@ `);


                            let userReport = await applyChargingReport({
                                toNumber: raabtaMap.get(incomingNumber).c_party_num,
                                fromNumber: raabtaMap.get(incomingNumber).b_party_num,
                                channelId: originatedChannel.id,
                                localDialogueId: raabtaMap.get(incomingNumber).cPartyDialogueId,
                                duration: `${ms}0`,
                                sequenceNum: counter,
                                isCall: 1,
                                uuid: raabtaMap.get(incomingNumber).uuid
                            })


                            // raabtaMap.get(incomingNumber).chargingReport0=1;
                            if (userReport.message !== "continue" || ms >= 3600)
                            {
                                console.log(`[${moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA")}] [ ${raabtaMap.get(incomingNumber).uuid }] charging loop hangup called `);
                                hangup(incomingNumber);
                            }


                            if (userReport.data.maxCallPeriodDuration !== undefined)
                            { 
                                //interval time will be updated till chargingReport api returns maxCallDuration as undefined.
                                console.log(`[${moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA")}] [ ${raabtaMap.get(incomingNumber).uuid }]  charging userReport.data.maxCallPeriodDuration ` + userReport.data.maxCallPeriodDuration);

                                time = (userReport.data.maxCallPeriodDuration - defaultConfig.chargeIntervalTime) * 100;
                                raabtaMap.get(incomingNumber).chargeIntervalTime = time;
                            }
                            else
                            { 
                                //call will be hangedUp when chanrgingReport Api returns maxCallDuration as undefined.
                                hangup(incomingNumber);
                            }
                        }, raabtaMap.get(incomingNumber).chargeIntervalTime); //charging testing is done on intervaltime => 15000 milliseconds
                    }
                });
            }
            else
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "] call is not answered ");


                
                raabtaMap.get(incomingNumber).failureCause = 'oAnswer_Api_response _maxCallPeriodDuration < 20_ lowBalance';
                playAndHangup(incomingChannel1, defaultConfig.soundsDirectory + prompts['10'], ari, incomingNumber);
            }
        }).catch((error) =>
        {
            if (raabtaMap.has(incomingNumber))
            {
                console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + raabtaMap.get(incomingNumber).uuid + "]  Error oAnswer ApiNotResponding ==>  " + error.message);
                
                raabtaMap.get(incomingNumber).failureCause = 'Error_oAnswer_Api_notResponding';
                playAndHangup(incomingChannel1, defaultConfig.soundsDirectory + prompts['4'], ari, incomingNumber);
            }

        })

    // raabtaMap.get(incomingNumber).intervalID = setInterval(startCharging,4000);
}

async function applyChargingReport(payload)
{ //function for calling aaplycharging api
    let
    {
        toNumber,
        fromNumber,
        channelId,
        localDialogueId,
        duration,
        sequenceNum,
        isCall,
        uuid
    } = payload;
    let report = await al.applyChargingReport(
    {
        toNumber,
        fromNumber,
        channelId,
        localDialogueId,
        duration,
        sequenceNum,
        isCall,
        uuid
    })
    console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + uuid + "] chargingReport:  " + JSON.stringify(report));
    if (report.data)
    {
        if (report.data.continueCall)
        {
            return {
                data: report.data,
                message: "continue"
            };
        }
        else
        {
            return {
                message: "hangup",
                status: report.status
            };
        }
    }
    else
    {
        return {
            message: "hangup",
            status: report.status
        };
    }
}

function insertCdr(map)
{ //function for inserting cdr's
    let response = bl.insertCdr(map)
    response.then((data) =>
    {
        if (data == 'inserted')
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + map.uuid + "] CDR already Inserted!")
        }
        else
        {
            console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + map.uuid + "] Data Inserted in DB " + JSON.stringify(data));
            deleteMap(map.a_party_num);
        }
    }).catch((err) =>
    {
        console.log("[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] [" + map.uuid + "] Data Insertion error " + err);
    });
}


const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));