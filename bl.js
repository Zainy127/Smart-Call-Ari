const db = require('./database/db');
const moment = require('moment');
const al = require('./al');


class bl 
{
    insertCdr(map)
    {

    const currentTime = Date.now();
    const date = new Date(currentTime);
    
    const formattedDate = `${date.getFullYear().toString()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}`;

    console.log("Formatted Date : ",formattedDate);

    const tableName = `ari_cdr_${formattedDate}`; 
    
        if(map.a_party_num && map.dataInserted == '0')
          {   
            if(map.a_party_num.startsWith("0"))
            {
              var aPartyNum = map.a_party_num.substring(1)
            }
            else
            {
              var aPartyNum = map.a_party_num
            }
            if(map.b_party_num.startsWith("0"))
            {
              var bPartyNum = map.b_party_num.substring(1)
            }
            else
            {
              var bPartyNum = map.b_party_num
            }
            if(map.c_party_num.startsWith("0")){
              var cPartyNum = map.c_party_num.substring(1)
            }
            else
            {
              var cPartyNum = map.c_party_num
            }
            var sip_outgoing_id;
            if(map.SIP_Outgoing_CallID)
            {
              sip_outgoing_id = map.SIP_Outgoing_CallID+map.uuid
            }
            else
            {
              sip_outgoing_id = ''
            }
            map.dataInserted = '1'
            
            var insertData =  "insert into `" + tableName + "` (`a_party`, `b_party`, `c_party`,`SIP_Incoming_CallID`, `SIP_Outgoing_CallID`,`incoming_channelID`, `outgoing_channelID`,`channel_bridgedID`,`callStartTime`,`InsertTime`,`uuid`, `Media_IP_Addr`,`Call_type`) values ('"+aPartyNum+"','"+bPartyNum+"','"+cPartyNum+"','"+map.SIP_Incoming_CallID+map.uuid+"','"+sip_outgoing_id+"','"+map.incoming_channelID+"','"+map.outgoing_channelID+"','"+map.channel_bridgedID+"','"+map.callStartTime+"','"+moment(Date.now()).format()+"','"+map.uuid+"','"+map.Media_IP_Addr+"','"+map.Call_type+"');";
            
              return new Promise ((resolve,reject)=>{
                db.query(insertData, (err,data)=> {
                  if(err)
                  {
                    reject(err);
                    console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ map.uuid+"] data: :["+JSON.stringify(data)+"] insertion error, table :"+tableName);
                  }
                  else
                  {
                    resolve(data);
                    console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ map.uuid+"] data: :["+JSON.stringify(data)+"] inserted successfully in table: "+tableName);
                  }
                });

             })
          }
          else
          {
            return new Promise ((resolve,reject)=>{
              var alredyInserted='inserted';
              resolve(alredyInserted);
            })            
          }
    }
    
    // update cdr's after bridging 
    async updateCdrAfterBridging(payload)
    { 
      console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ payload.uuid+"]payload recieved for updateCdrAfterBridging ");
      const currentTime = Date.now();
      const date = new Date(currentTime);
    
      const formattedDate = `${date.getFullYear().toString()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}`;
      console.log(formattedDate)
      const tableName = `ari_cdr_${formattedDate}`; 

      
      let updateQuery = `UPDATE ${tableName} SET c_party='${payload.c_party_num}', b_party='${payload.b_party_num}', SIP_Outgoing_CallID='${payload.SIP_Outgoing_CallID}', outgoing_channelID='${payload.outgoing_channelID}',channel_bridgedID='${payload.channel_bridgedID}',bridge_start_time='${payload.bridgeStartTime}' WHERE incoming_channelID='${payload.incoming_channelID}'`;

      return new Promise ((resolve,reject)=>{
        let dbResponse = db.query(updateQuery, (err,data)=> {
          if(err)
          {
            reject(err);
            console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+payload.uuid+"] data:["+JSON.stringify(data)+"] updating error , table :"+tableName);
          }
          else
          {
            resolve(data);
            console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ payload.uuid+"] data:["+JSON.stringify(data)+"]updated successfully in table: "+tableName);

          }
        });
        return dbResponse;

     })
  }

  
  async updateCdrOnHangup(payload)
  { 
    const currentTime = Date.now();
    const date = new Date(currentTime);
    
    
    const formattedDate = `${date.getFullYear().toString()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}`;
    console.log(formattedDate)
    const tableName = `ari_cdr_${formattedDate}`; 
    
     let updateQuery = `UPDATE ${tableName} SET callEndTime='${payload.callEndTime}' ,Failure_cause='${payload.failureCause}' WHERE incoming_channelID='${payload.incoming_channelID}'`;
    return new Promise ((resolve,reject)=>{
      let dbResponse = db.query(updateQuery, (err,data)=> {
        if(err)
        {
          reject(err);
          console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ payload.uuid+"] data:["+JSON.stringify(data)+"] updating error , table :"+tableName);
        }
        else
        {
          resolve(data);
          console.log(  "[" + moment(Date.now()).format("DD-MM-YYYY hh:mm:ssA") + "] ["+ payload.uuid+"]  data::["+JSON.stringify(data)+"] updated successfully in table: "+tableName);
        }
      });
      return dbResponse;
   })
}
}


module.exports = new bl();
