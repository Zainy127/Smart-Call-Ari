const http = require('http')
const url = require('url')
const client = require('prom-client')

// Create a Registry which registers the metrics
const register = new client.Registry();

// Add a default label which is added to all metrics
register.setDefaultLabels({
    app: 'smart-call-ari-messages-stats'
})



const CallGenratedtoBParty = new client.Counter({
    name: 'CallGenratedtoBParty',
    help: 'Total number of  CallGenratedtoBParty'
});
const callOriginationToBpartyFailed = new client.Counter({
    name: 'callOriginationToBpartyFailed',
    help: 'Total number of  CallGenratedtoBParty'
});
const oAnswer = new client.Counter({
    name: 'oAnswer',
    help: 'Total number of oAnswer'
});

const oAbandon = new client.Counter({
    name: 'oAbandon',
    help: 'Total number of oAbandon'
});
const oNoAnswer = new client.Counter({
    name: 'oNoAnswer',
    help: 'Total number of oNoAnswer'
});
const oCalledPartyBusy = new client.Counter({
    name: 'oCalledPartyBusy',
    help: 'Total number of oCalledPartyBusy'
});
const oDisconnect = new client.Counter({
    name: 'oDisconnect',
    help: 'Total number of oDisconnect'
});
const ApplyChargingReport = new client.Counter({
    name: 'ApplyChargingReport',
    help: 'Total number of ApplyChargingReport'
});
const initialDpReq =new client.Counter({ 
     name: 'initialDpReq',
    help: 'Total number of initialDpReq'
});

const ApiNotResponding = new client.Counter({
    name: 'ApiNotResponding',
    help: 'Total number of ApiNotResponding'
});

const oAnswerApiNotResponding = new client.Counter({
    name: 'oAnswerApiNotResponding',
    help: 'Total number of oAnswerApiNotResponding'
});



const oAbandonApiNotResponding = new client.Counter({
    name: 'oAbandonApiNotResponding',
    help: 'Total number of oAbandonApiNotResponding'
});

const oNoAnswerApiNotResponding = new client.Counter({
    name: 'oNoAnswerApiNotResponding',
    help: 'Total number of oNoAnswerApiNotResponding'
});

const oCalledPartyBusyApiNotResponding = new client.Counter({
    name: 'oCalledPartyBusyApiNotResponding',
    help: 'Total number of oCalledPartyBusyApiNotResponding'
});

const oDisconnectApiNotResponding = new client.Counter({
    name: 'oDisconnectApiNotResponding',
    help: 'Total number of oDisconnectApiNotResponding'
});

const ApplyChargingReportApiNotResponding = new client.Counter({
    name: 'ApplyChargingReportApiNotResponding',
    help: 'Total number of ApplyChargingReportApiNotResponding'
});


const initialDpReqApiNotResponding = new client.Counter({
    name: 'initialDpReqApiNotResponding',
    help: 'Total number of initialDpReqApiNotResponding'
});

const updatevcallcounter = new client.Counter({
    name: 'updatevcallcounter',
    help: 'Total number of updatevcallcounter'
});

const updatevcallcounterApiNotResponding = new client.Counter({
    name: 'updatevcallcounterApiNotResponding',
    help: 'Total number of updatevcallcounterApiNotResponding'
});

const blackLists = new client.Counter({
    name: 'blackLists',
    help: 'Total number of blackLists'
});

const blackListsApiNotResponding = new client.Counter({
    name: 'blackListsApiNotResponding',
    help: 'Total number of blackListsApiNotResponding'
});

const voicecallprocess = new client.Counter({
    name: 'voicecallprocess',
    help: 'Total number of voicecallprocess'
});

const voicecallprocessApiNotResponding = new client.Counter({
    name: 'voicecallprocessApiNotResponding',
    help: 'Total number of voicecallprocessApiNotResponding'
});

const pinprocess = new client.Counter({
    name: 'pinprocess',
    help: 'Total number of pinprocess'
});

const pinprocessApiNotResponding = new client.Counter({
    name: 'pinprocessApiNotResponding',
    help: 'Total number of pinprocessApiNotResponding'
});

const chargingpayg = new client.Counter({
    name: 'chargingpayg',
    help: 'Total number of chargingpayg'
});

const chargingpaygApiNotResponding = new client.Counter({
    name: 'chargingpaygApiNotResponding',
    help: 'Total number of chargingpaygApiNotResponding'
});

const SendRoutingInfoRequest = new client.Counter({
    name: 'SendRoutingInfoRequest',
    help: 'Total number of SendRoutingInfoRequest'
});
const SendRoutingInfoRequestApiNotResponding = new client.Counter({
    name: 'SendRoutingInfoRequestApiNotResponding',
    help: 'Total number of SendRoutingInfoRequestApiNotResponding'
});

const lowBalance = new client.Counter({
    name: 'lowBalance',
    help: 'Total number of lowBalance'
});


// Enable the collection of default metrics
register.registerMetric(CallGenratedtoBParty);
register.registerMetric(callOriginationToBpartyFailed);
register.registerMetric(oAnswer);//
register.registerMetric(oAnswerApiNotResponding);//
register.registerMetric(oAbandon);//
register.registerMetric(oAbandonApiNotResponding);
register.registerMetric(oNoAnswer);//
register.registerMetric(oNoAnswerApiNotResponding);
register.registerMetric(oCalledPartyBusy);//
register.registerMetric(oCalledPartyBusyApiNotResponding);
register.registerMetric(oDisconnect);//
register.registerMetric(oDisconnectApiNotResponding);
register.registerMetric(ApplyChargingReport);//
register.registerMetric(ApplyChargingReportApiNotResponding);
register.registerMetric(ApiNotResponding);//
register.registerMetric(initialDpReqApiNotResponding);
register.registerMetric(initialDpReq);//
register.registerMetric(updatevcallcounter);
register.registerMetric(updatevcallcounterApiNotResponding);
register.registerMetric(blackLists);
register.registerMetric(blackListsApiNotResponding);
register.registerMetric(voicecallprocess);
register.registerMetric(voicecallprocessApiNotResponding);
register.registerMetric(pinprocess);
register.registerMetric(pinprocessApiNotResponding);
register.registerMetric(chargingpayg);
register.registerMetric(chargingpaygApiNotResponding);
register.registerMetric(SendRoutingInfoRequest);
register.registerMetric(SendRoutingInfoRequestApiNotResponding);
register.registerMetric(lowBalance);
client.collectDefaultMetrics({ register });
// Define the HTTP server
const server = http.createServer({ keepAlive: true },async (req, res) => {
    // Retrieve route from request object
    const route = url.parse(req.url).pathname
    if (route === '/metrics') {
        // Return all metrics the Prometheus exposition format
        res.setHeader('Content-Type', register.contentType)
        res.end(await register.metrics());
        // res = register.matrics();
    } else if (route === '/oAnswer') {
        oAnswer.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oAnswerApiNotResponding') {
        oAnswerApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/CallGenratedtoBParty') {
	    CallGenratedtoBParty.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/callOriginationToBpartyFailed') {
        callOriginationToBpartyFailed.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oAbandon') {
        oAbandon.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oAbandonApiNotResponding') {
        oAbandonApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oNoAnswer') {
        oNoAnswer.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/oNoAnswerApiNotResponding') {
        oNoAnswerApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oCalledPartyBusy' ) {
        oCalledPartyBusy.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/oCalledPartyBusyApiNotResponding' ) {
        oCalledPartyBusyApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/oDisconnect') {
        oDisconnect.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/oDisconnectApiNotResponding') {
        oDisconnectApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/ApplyChargingReport') {
        ApplyChargingReport.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/ApplyChargingReportApiNotResponding') {
        ApplyChargingReportApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/initialDpReq') {
        initialDpReq.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/initialDpReqApiNotResponding') {
        initialDpReqApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/updatevcallcounter') {
        updatevcallcounter.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/updatevcallcounterApiNotResponding') {
        updatevcallcounterApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/blackLists') {
        blackLists.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/blackListsApiNotResponding') {
        blackListsApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/voicecallprocess') {
        voicecallprocess.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/voicecallprocessApiNotResponding') {
        voicecallprocessApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/pinprocess') {
        pinprocess.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/pinprocessApiNotResponding') {
        pinprocessApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/chargingpayg') {
        chargingpayg.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/chargingpaygApiNotResponding') {
        chargingpaygApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/SendRoutingInfoRequest') {
        SendRoutingInfoRequest.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/SendRoutingInfoRequestApiNotResponding') {
        SendRoutingInfoRequestApiNotResponding.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    }else if (route === '/lowBalance') {
        lowBalance.inc(1); 
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200 
        res.write(`${route} has been incremented`);
        res.end();
    } else if (route === '/ApiNotResponding') {
        ApiNotResponding.inc(1);
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }
    else{
        res.setHeader("Content-Type", register.contentType);
        res.setHeader('Connection', 'keep-alive');
        res.statusCode = 200
        res.write(`${route} has been incremented`);
        res.end();
    }
    //return;
})
// Start the HTTP server which exposes the metrics on http://localhost:8070/metrics
server.listen(8070,()=>{
    console.log( ` prometheus server is listning on => http://localhost:8070/metrics `);
}    
)
