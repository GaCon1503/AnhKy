// /////////////////////////THIẾT LẬP KẾT NỐI WEB/////////////////////////
var express = require("express");
var app = express();
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", "./views");
var server = require("http").Server(app);
var io = require("socket.io")(server);
var port = 3000
server.listen(port);
console.log("server starting open port: ",port)
// Home calling
app.get("/", function(req, res){
    res.render("home")
});


var plc_values = {};
plc_values['Connected'] = false;

/* var variables = {
	AUTO_MODE: 'DB1,X0.0',
	CMD_START: 'DB1,X0.1',
	CMD_STOP: 'DB1,X0.2',
  CMD_RESET: 'DB1,X0.3',
	PS_STATUS: 'DB1,X0.4',
	TEST_PUMP_FAULT: 'DB1,X0.5',
	PUMP_STATUS: 'DB1,INT2',        // INT
	ALARM_STATUS: 'DB1,INT4',        // INT
	PRESSURE_SP: 'DB1,REAL6',        // REAL
	PRESSURE_PV: 'DB1,REAL10',        // REAL
	FREQUENCY: 'DB1,REAL14',        // REAL
	CURRENT: 'DB1,REAL18',        // REAL
	POWER: 'DB1,REAL22',        // REAL
};
 */
//Thiết lập kết nối đến mqtt server
const mqtt = require('mqtt');
const { data } = require('jquery');
const mqttprotocol = 'mqtt'
const mqtthost = 'localhost'
const mqttport = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`

const connectUrl = `${mqttprotocol}://${mqtthost}:${mqttport}`

const receive_topic = '/PLC-S71200/0905XXX713/ReadValues'
const send_topic = '/PLC-S71200/0905XXX713/WriteValues'

const mqttclient = mqtt.connect(connectUrl, {
  clientId,
  clean: true,
  connectTimeout: 4000,
  username: 'mymqtt',
  password: 'mqtt@123',//'mymqtt@2024',
  reconnectPeriod: 1000,
})

mqttclient.on('connect', () => {
  console.log('mqtt Connected');
  mqttclient.subscribe([receive_topic], () => {
    console.log(`Subscribe to topic '${receive_topic}'`)
    
  })
})

mqttclient.on('offline', function() {
    console.log("mqtt offline");
});
//gửi dữ liệu client đến gateway
function fn_send_to_gateway(values){
  if (mqttclient.connected){
    mqttclient.publish(send_topic, JSON.stringify(values), { qos: 0, retain: false }, (error) => {
      if (error) {
        console.error(send_topic,error)
      }
    })
  }
}
//nhận dữ liệu từ gateway
var last_received_ts = 0;
mqttclient.on('message', (topic, payload) => {
  //console.log(topic, payload)
  if (topic !== receive_topic){
    console.log('Received Message:', topic, payload.toString())
    return;
  }
  plc_values = JSON.parse(payload.toString());
  last_received_ts = new Date().getTime();
  //console.log(topic,plc_values);  
  check_ALARM_STATUS(plc_values['ALARM_STATUS']);
})

function getDateTime_string(ts = 0){
  let date = new Date();
  if (ts > 0) date = new Date(ts);
  let d = ("0" + date.getDate()).slice(-2);
  let m = ("0" + (date.getMonth()+1)).slice(-2);
  let y = date.getFullYear();
  let h = ("0" + date.getHours()).slice(-2);
  let mi = ("0" + date.getMinutes()).slice(-2);
  let s = ("0" + date.getSeconds()).slice(-2);
  return d + "/" + m + "/" + y + " " + h + ":" + mi + ":" + s;
}

var alarm_value_old = 0;
var alarm_msg = ["Cảnh báo lỗi bơm","Cảnh báo áp suất thấp"];
var alarm_status = [0,0];
var alarm_msg_last = "";
function check_ALARM_STATUS(al){
  alarm = alarm_value_old ^ al; //XOR
  for (var i = 0; i < alarm_msg.length; i++){
    let val = 1 << i;
    if ((alarm & val) > 0){
      if ((al & val) > 0) alarm_status[i] = new Date().getTime();
      else alarm_status[i] = 0;
    }
  }
  if (alarm_value_old != al) {    
    let ts = 0;
    let msg = "";
    for (var i = 0; i < alarm_status.length; i++){
        if (alarm_status[i] > ts) {
          ts = alarm_status[i];
          msg = alarm_msg[i];
        }
    }
    if (ts > 0) alarm_msg_last = getDateTime_string(ts) + " " + msg;
    else alarm_msg_last = "";
    console.log(alarm_status,alarm_msg_last);
  }
  alarm_value_old = al;
}
// ///////////GỬI DỮ LIỆU BẢNG TAG ĐẾN CLIENT (TRÌNH DUYỆT)///////////
io.on("connection", function(socket){
  socket.on("Client-send-data", function(data){
    io.sockets.emit("values", plc_values);
    io.sockets.emit("alarm_msg", alarm_msg_last);
  });
});

// ///////////GHI DỮ LIỆU NÚT NHẤN XUỐNG PLC///////////////////
io.on("connection", function(socket){
    // Lệnh ghi
    socket.on("cmd_Write_to_PLC", function(data){
        console.log(data)
        if (data.length === 2) fn_send_to_gateway(data);
    });
});

//kiểm tra kết nối với gateway
setInterval(function() {
  let ts = new Date().getTime();
  if (ts - last_received_ts > 2000) plc_values['Connected'] = false;
}, 2000);

//lưu dữ liệu vào csdl mysql
//npm install --save mysql2
var mysql = require('mysql2');

var mysqlcon = mysql.createConnection({
  host: "localhost",
  user: "root", //admin
  password: "123456",
  database: "webserver",
  dateStrings: true,
});

mysqlcon.connect(function(err) {
  if (err) throw err;
  console.log("mysql Connected!");
  let sql = "SELECT * FROM webserver.history_data ORDER BY `thoigian` DESC LIMIT 0,2;";
  mysqlcon.query(sql, function(error,result){
      if (error) throw error;
      //console.log(result)
      result.forEach(obj => {
        console.log(obj['thoigian'],obj['apsuat_chay'])
      });
  })
});

//chu ky lưu dữ liệu 1 phút 1 mẫu
const log_interval = 5; //giây
setInterval(function() {
  //kiểm tra kết nối plc
  if (!plc_values['Connected']) return;
  let ts = Math.floor(new Date().getTime()/1000);
  if (ts % log_interval > 0) return;
  let sp = parseFloat(plc_values['PRESSURE_SP']).toFixed(2);
  let pv = parseFloat(plc_values['PRESSURE_PV']).toFixed(2);
  let f = parseFloat(plc_values['FREQUENCY']).toFixed(1);
  let c = parseFloat(plc_values['CURRENT']).toFixed(1);
  let pw = parseFloat(plc_values['POWER']).toFixed(1);
  //console.log('lưu vào csdl PRESSURE_PV=',pv)
  let dt = getDateTime_sql();
  let sql = "INSERT INTO `history_data` (`thoigian`, `apsuat_dat`, `apsuat_chay`, `tanso`, `dongdien`, `congsuat`) VALUES (" +
  `'${dt}', ${sp}, ${pv}, ${f}, ${c}, ${pw});`
  console.log(sql)
  mysqlcon.query(sql, function(error,result){
    if (error) throw error;
    console.log(result)
  })

}, 1000);
function getDateTime_sql(ts = 0){
  let date = new Date();
  if (ts > 0) date = new Date(ts);
  let d = ("0" + date.getDate()).slice(-2);
  let m = ("0" + (date.getMonth()+1)).slice(-2);
  let y = date.getFullYear();
  let h = ("0" + date.getHours()).slice(-2);
  let mi = ("0" + date.getMinutes()).slice(-2);
  let s = ("0" + date.getSeconds()).slice(-2);
  return y + "-" + m + "-" + d + " " + h + ":" + mi + ":" + s;
}
//Lệnh lấy lịch sử dữ liệu
io.on("connection", function(socket){
  // Lệnh ghi
  socket.on("get_Report", function(data){
      if (data.length < 2) return;
      let time_from1 = data[0].replace("T"," ") + ":00";
      let time_to1 = data[1].replace("T"," ") + ":00";
      let timeRange = "'" + time_from1 + "' AND '" + time_to1 + "'";
      let chs = "*";
      if (data.length >= 3 && data[2] != "") chs = "thoigian," + data[2];
      let sql = "SELECT " + chs + " FROM history_data WHERE thoigian BETWEEN " + timeRange + " ORDER BY thoigian ASC LIMIT 0,1000;";
      console.log(sql)
      mysqlcon.query(sql, function(error,result){
        if (error) throw error;
        console.log(result)
        io.sockets.emit("Report_Data", result);
      })
  });
});