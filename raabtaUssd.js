const defaultConfig = require('./config.json');
const client = require('ari-client');
const util = require('util');
const wait = util.promisify(setTimeout);
const clearWait = util.promisify(clearTimeout);

const log = console.log;
const moment = require('moment');
const uuidv4 = require('uuid').v4;
let raabtaMap = new Map();
var ari_set = '';

const ipaddr = require('ip');

let ivrSessions = {};
const axios = require('axios');
const PROMPTS_PATH = 'sound:' + defaultConfig.main_prompts_path;

let hangupPrompts = {
    "1": "sound:When_A_Party_is_Jazz_postpaid",
    "2": "sound:When_A_Party_is_Jazz_postpaid",
    
    "5": "sound:press_1_to_accept_call",
    "6": "sound:B_Party_Rejects_CC_Request",
    "7": "sound:Main_Prompt_Party_A",
    "8": "sound:B_Party_Busy_On_Another_Call",
    "9": "sound:B_Party_Balance_Insufficient",
    "10": "sound:B_Party_PoweredOFF"
};

// the kafka instance and configuration variables are the same as before
const { Kafka } = require("kafkajs")

// the client ID lets kafka know who's producing the messages
const clientId = defaultConfig.kafkaClientId


// we can define the list of brokers in the cluster
const brokers = defaultConfig.kafkaBrokers
// this is the topic to which we want to write messages
const topic = defaultConfig.kafkaTopic

// initialize a new kafka client and initialize a producer from it
const kafka = new Kafka({ clientId, brokers })


// create a new consumer from the kafka client, and set its group ID
// the group ID helps Kafka keep track of the messages that this client
// is yet to receive
const consumer = kafka.consumer({ groupId: clientId })

// consumerFn()
function consumerFn (ari) 
{
	// first, we wait for the client to connect and subscribe to the given topic
	 consumer.connect()
	 consumer.subscribe({ topic })
	 consumer.run({
		// this function is called every time the consumer gets a new message
		eachMessage: ({ message }) => {
			
			var messageData = JSON.parse(message.value)
			console.log('received message:'+JSON.stringify(messageData))
            var a_party = messageData.a_party
            var b_party = messageData.b_party
            var c_party = messageData.c_party
            var callId = messageData.id
            setUserData(a_party,b_party,c_party,callId,ari)
		},
	})
}

function setUserData (a_party,b_party,c_party,callId,ari)
{

  var a_party_num= a_party
  var b_party_num= b_party
  var c_party_num= c_party
  const uuid = uuidv4();
  let ari_set = ari
  raabtaMap.set(c_party_num+uuid, {
    "id": callId,
    "a_party_num": a_party_num,
    "b_party_num": b_party_num,
    "c_party_num": c_party_num,
    "processed_dt": moment(Date.now()).format(),
    "c_party_channelId": "",
    "b_party_channelId":"",
    "uuid": uuid
  });
  console.log("[" + moment(Date.now()).format() + "] After Allocation Mapsize is = " + raabtaMap.size)
    
    console.log("Call will go from "+a_party_num+" to "+b_party_num+" Using CLI"+c_party_num)
    originateChannel({a_party_num,b_party_num,c_party_num,ari_set,uuid})
    // console.log(payload.a_party)
}

function sleep(ms) 
{
  return new Promise((resolve) => {
      setTimeout(resolve, ms);
  });
}
function main(payload) 
{

    let aPartyTimeHandler = false;
    let bPartyTimeHandler = false;
    const { appName } = payload;
    
    client.connect(defaultConfig.asteriskHost, defaultConfig.asteriskUserName, defaultConfig.asteriskPass,
        function (err, ari) {
          
          if (err) {
            console.log("[" + moment(Date.now()).format() + "] === Asterisk CONNECTION Failed ===")
            throw err; // program will crash if it fails to connect
          } else {
            ari_set = ari
            console.log("[" + moment(Date.now()).format() + "] === Asterisk CONNECTION SUCCESSFUL ===")
            // ariOnConnection = ari;
            consumerFn(ari)
            ari.on('StasisStart', (event, channel) => channelStatisStart({
              event,
              channel,
              ari,
            }));
            ari.on('ChannelStateChange', (event, channel) => ChannelStateChange({
              event,
              channel,
              ari,
              // playback,
              // campaignAudioName
            }))
            // ari.on('ChannelDtmfReceived', (event, channel) => ChannelDtmfReceived({
            //   event,
            //   channel,
            //   ari,
            //   // playback,
            //   campaignAudioName
            // }));
            // ari.on('ChannelHangupRequest', channelHangupRequest);
            ari.on('ChannelDestroyed', (event, channel) => channelDestroyed({
              event,
              channel,
              ari,
              // playback,
              // campaignAudioName
            }));
            ari.on('StasisEnd', (event, channel) => channelStasisEnd({
              event,
              channel,
              ari,
              // playback,
              // campaignAudioName
            }));
            // ari.removeListener('ChannelDtmfReceived', ChannelDtmfReceived)
            // ari.removeListener('ChannelHangupRequest', channelHangupRequest)
            ari.removeListener('ChannelDestroyed', channelDestroyed)
            // ari.removeListener('ChannelStateChange', ChannelStateChange)
            // can also use ari.start(['app-name'...]) to start multiple applications
            ari.start('vas_raabta_ussd');
      
          }
        });
      
}
function originateChannel(payload){
  var ari = payload.ari_set
  var uuid = payload.uuid
  console.log("=========Calling======"+payload.a_party_num+"=========FROM========="+defaultConfig.raabtaShortCode)
  ari.channels.originateWithId({
    app: 'vas_raabta_ussd',
    endpoint:'SIP/'+defaultConfig.trunkName+'/'+payload.a_party_num,
    // context:"internal",
    // endpoint: 'Local/'+payload.c_party_num+'@internal',
    callerId: defaultConfig.raabtaShortCode,
    // callerId: '100',
    appArgs: 'dialed',
    channelId: payload.c_party_num+uuid
  },
  function (err, channel) {
    if (err) {
      console.log(err)
      throw err;
    }
  }
).then(
  console.log("[" + moment(Date.now()).format() + "] Originated Call for: " + payload.a_party_num)
)
.catch(e => console.error("[" + moment(Date.now()).format() + "] [ORIGNATION Error:]" + e.message, e))
  // ari.channels.originate({app: 'vas_raabta_v1', endpoint: 'SIP/'+payload.b_party_num+'@from-asterisk2',callerId :payload.a_party_num,appArgs: 'dialed'})

}
function channelStatisStart(payload) {
  var playback = payload.ari.Playback();
    // let { event, channel, ari, aPartyTimeHandler, bPartyTimeHandler } = payload;
    // // let numData = setUserData.userData
    // const asteriskString = event.args[0];
    // console.log("string  is : "+asteriskString)
    // var splitted = asteriskString.split('*', 5)
    // //console.log("================Splitted==================="+splitted)
    // userData.userChannel = channel
    // userData.pincode = splitted[2]
    // userData.party_A_num = splitted[3]
    // userData.party_B_num = splitted[4].slice(0, -1)
    // console.log("====Shortcode====="+splitted[1])
    // console.log("====Pin Code====="+userData.pincode)
    // console.log("====Party A Number====="+userData.party_A_num)
    // console.log("====Party B Number====="+userData.party_B_num)

    // // checkpinCode(userData.party_A_num,userData.pincode,userData.party_B_num, userData.userChannel)
    // channel.originate({app: 'vas_raabta_v1', endpoint: 'SIP/'+toMsisdn,callerId :fromMsisdn,appArgs: 'dialed'})

    // console.log("================Splitted==================="+splitted.toString().replace(/[^a-zA-Z ]/g, ""));
    

}

function ChannelStateChange(payload) {
  
  var state = payload.channel.state
  if (state == "Ringing") {
    // sleep(200).then(() => {
    console.log("[" + moment(Date.now()).format() + "] State RINGING ====== " + payload.channel.id)
    
  } else if (state == "Up") {
    if(raabtaMap.has(payload.channel.id)) {
      raabtaMap.get(payload.channel.id).c_party_channelId = payload.channel.id
    console.log("[" + moment(Date.now()).format() + "] State UP ====== " + payload.channel.id + " == Playing Audio == hello world")
    var playback = payload.ari.Playback();
    payload.channel.play({media: 'sound:hello-world'},
                  playback, function(err, newPlayback) {
      if (err) {
        throw err;
      }
    });
    var channelId = payload.channel.id
    var ari = payload.ari
    var bparty = raabtaMap.get(payload.channel.id).b_party_num
    var aparty = raabtaMap.get(payload.channel.id).a_party_num
    var cparty = raabtaMap.get(payload.channel.id).c_party_num
   
  // console.log("No channel")

    ari.channels.move({
      app: 'IVR',
      appArgs:['ussd',aparty,bparty,cparty],
      channelId: channelId
    })
    .then(function () {
      console.log("[" + moment(Date.now()).format() + "] ========== Channel Moved ========== "+ channelId)
    })
    .catch(function (err) {
      throw err;
    });
    }
    else{
      // console.log("No channel")
    }
}
}


function channelStasisEnd(payload)
{
  console.log("Stasis old End!"+payload.channel.id)
}
function channelDestroyed(payload) 
{
  if(raabtaMap.has(payload.channel.id)) 
    {
    console.log(payload.channel.id+"******** old Channel Destroyed******")
    raabtaMap.delete(payload.channel.id)
    console.log("[" + moment(Date.now()).format() + "] After Deletion Mapsize is = " + raabtaMap.size)
          
  }
}

module.exports = main;

main({ appName: "vas_raabta_ussd" });
