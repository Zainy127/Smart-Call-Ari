// const db = require('./database/tableCreationDB');
const schedule = require('node-schedule');
const moment = require('moment');
const axios = require('axios');
var mysql = require('mysql2');

  
  console.log("["+moment().format(`YYYY-MM-DD HH:mm:ss`)+"]"+" @@@@@@@@@@@@@@@ scheduler started @@@@@@@@@@@@@ ")         
     
  const job = schedule.scheduleJob('0 0 * * *', async() => {
    console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" + " creating table every day at 0:0:0 (midnight)")

    try{
        var db =  mysql.createConnection({
          host: "127.0.0.1",
          database: "ari_cdr_raabta",
          user: "gr_replicationuser",
          password: "Switch@123@Raabta123",
          port: "6446"
        });
        console.log("["+moment().format(`YYYY-MM-DD HH:mm:ss`)+"]"+'Database ari_cdr_raabta logged in successfully');
      }catch(err){
        console.log("["+moment().format(`YYYY-MM-DD HH:mm:ss`)+"]"+'Error logging into db:', err);
        process.exit(1);
      }

    db.connect((err) => {
      if (err) {
        console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Error connecting to database on 1st try:', err);
        db.connect((err) => {
            if (err) {
              console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Error connecting to database on  2nd try:', err);
              db.connect((err) => {
                if (err) 
                {
                  console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Error connecting to database on 3rd try:', err);
                  process.exit(1); // exit process on connection error
                } else {
                  console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Database connected successfully');
                  console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Database connected successfully, ' +"Connection thread ID:", db.threadId);
                  createTable(db);
                }
              }); 
            } 
            else 
            {
              
              console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Database connected successfully, ' +"Connection thread ID:", db.threadId);
              createTable(db);
            }
          }); 
      } else {
        // console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Database connected successfully');
        console.log("[" + moment().format(`YYYY-MM-DD HH:mm:ss`) + "]" +'Database connected successfully, ' +"Connection thread ID:", db.threadId);
        createTable(db);
      }
    }); 
  });


async function createTable(connection)  
{
    const currentTime = Date.now();
    console.log("["+moment().format(`YYYY-MM-DD HH:mm:ss`)+"]"+"  @@@@@@@@@@@@@@@ inside createTable function@@@@@@@@@@@@@")        
    const date = new Date(currentTime);
    
    const formattedDate = `${date.getFullYear().toString()}_${(date.getMonth() + 1).toString().padStart(2, '0')}_${date.getDate().toString().padStart(2, '0')}`;
    console.log(formattedDate)


    const tableName = `ari_cdr_${formattedDate}`;         

    const createTableQuery = `CREATE TABLE IF NOT EXISTS \`${tableName}\` (
    \`AriCdrID\` bigint NOT NULL AUTO_INCREMENT,
    \`a_party\` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`b_party\` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`c_party\` varchar(15) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`SIP_Incoming_CallID\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`SIP_Outgoing_CallID\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
    \`incoming_channelID\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`outgoing_channelID\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
    \`channel_bridgedID\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
    \`bridge_start_time\` datetime DEFAULT NULL,
    \`CallStartTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`CallEndTime\` datetime(6) DEFAULT NULL,
    \`LastUpdated\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
    \`InsertTime\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    \`uuid\` varchar(255) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,
    \`Media_IP_Addr\` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci NOT NULL,
    \`Failure_cause\`varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL,
    \`Call_type\` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_general_ci DEFAULT NULL,  
    PRIMARY KEY (\`AriCdrID\`) USING BTREE,
    UNIQUE KEY \`sessions_u1\` (\`incoming_channelID\`) USING BTREE,
    UNIQUE KEY \`session_u2\` (\`SIP_Incoming_CallID\`) USING BTREE,
    KEY \`sessions_i1\` (\`CallStartTime\`) USING BTREE,
    KEY \`sessions_i2\` (\`CallEndTime\`) USING BTREE,
    KEY \`idxCtyp\` (\`Call_type\`)
    ) ENGINE=InnoDB AUTO_INCREMENT=22 DEFAULT CHARSET=utf8mb3 ROW_FORMAT=DYNAMIC;`;
  
      connection.query(createTableQuery, (err, result) => {
        if (err) 
        {
            console.error(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] Failed to create table ${tableName}: ${err.message}`);
        } 
        else 
        {
            console.error(`[${moment().format(`YYYY-MM-DD HH:mm:ss`)}] Table ${tableName} created successfully`);
        }     
    });
}

