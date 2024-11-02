var firstTime = true;
var plcconnected = false;
////////////// YÊU CẦU DỮ LIỆU TỪ SERVER- REQUEST DATA //////////////
var myVar = setInterval(myTimer, 500);
function myTimer() {
    socket.emit("Client-send-data", "Request data client");
}
//document loaded
$(function() {
    draw_Chart();
    socket.on("values",function(data){
        plc_values = data;
        plcconnected = plc_values['Connected'];
        if (plc_values['AUTO_MODE']) {
            document.getElementById('btn_auto').style.backgroundColor = 'green';
            document.getElementById('btn_manual').style.backgroundColor = 'gray';
            //khóa chức năng điều khiển bằng tay
            document.getElementById("btn_start").disabled = true;
            document.getElementById("btn_stop").disabled = true;
        }
        else{
            document.getElementById('btn_auto').style.backgroundColor = 'gray';
            document.getElementById('btn_manual').style.backgroundColor = 'green';
            //cho phép điều khiển bằng tay
            document.getElementById("btn_start").disabled = false;
            document.getElementById("btn_stop").disabled = false;
        }
        //
        if (!plcconnected) plc_values['PUMP_STATUS'] = -1;
        display_pump_status('pumpicon',plc_values['PUMP_STATUS'])
        //
        if (plc_values['PUMP_STATUS'] == 1) {
            document.getElementById('btn_start').style.backgroundColor = 'green';
            document.getElementById('btn_stop').style.backgroundColor = 'gray';
        }
        else{
            document.getElementById('btn_start').style.backgroundColor = 'gray';
            document.getElementById('btn_stop').style.backgroundColor = 'red';
        }
        //
        if (plc_values['PS_STATUS']) {
            document.getElementById('ps-circle').style.backgroundColor = 'green';
        }
        else{
            if (flashing) document.getElementById('ps-circle').style.backgroundColor = 'yellow';
            else document.getElementById('ps-circle').style.backgroundColor = 'red';
        }
        //alarm1-circle
        let alarm1 = plc_values['ALARM_STATUS'] & 1;
        if (alarm1 == 0) {
            document.getElementById('alarm1-circle').style.backgroundColor = 'gray';
        }
        else{
            document.getElementById('alarm1-circle').style.backgroundColor = 'orangered';
        }
        //alarm2-circle
        let alarm2 = plc_values['ALARM_STATUS'] & 2;
        if (alarm2 == 0) {
            document.getElementById('alarm2-circle').style.backgroundColor = 'gray';
        }
        else{
            document.getElementById('alarm2-circle').style.backgroundColor = 'orangered';
        }
        //hiển thị thông số
        display_float_textContent('pressure_pv',plc_values['PRESSURE_PV'],2,'bar');
        display_float_textContent('frequency',plc_values['FREQUENCY'],1,'Hz');
        display_float_textContent('current',plc_values['CURRENT'],1,'A');
        display_float_textContent('power',plc_values['POWER'],1,'kW');
        
       /* document.getElementById('pressure_pv').textContent = plc_values['PRESSURE_PV'] + " bar";        
        document.getElementById('frequency').textContent = plc_values['FREQUENCY'] + " Hz";
        document.getElementById('current').textContent = plc_values['CURRENT'] + " A";
        document.getElementById('power').textContent = plc_values['POWER'] + " kW";
        document.getElementById('pressure_sp').value = plc_values['PRESSURE_SP'];*/
		
        display_float_value('pressure_sp',plc_values['PRESSURE_SP'],1);
        if (firstTime && plcconnected) {
            //document.getElementById('pressure_sp_new').value = plc_values['PRESSURE_SP'];
            display_float_value('pressure_sp_new',plc_values['PRESSURE_SP'],1);
            firstTime = false;
        }
        
    });
    socket.on("alarm_msg",function(data){
        document.getElementById('alarm_lable').textContent = data;
    });
    socket.on('disconnect', function () {
        document.getElementById('alarm_lable').textContent = getDateTime_string() + " MẤT KẾT NỐI ĐẾN SERVER";
    });
});

//Vẽ đồ thị
setInterval(function(){
    if (plcconnected) Add_Chart_Point(plc_values['PRESSURE_SP'],plc_values['PRESSURE_PV']);
},1000);
function getDateTime_string(){
    let date = new Date();
    let d = ("0" + date.getDate()).slice(-2);
    let m = ("0" + (date.getMonth()+1)).slice(-2);
    let y = date.getFullYear();
    let h = ("0" + date.getHours()).slice(-2);
    let mi = ("0" + date.getMinutes()).slice(-2);
    let s = ("0" + date.getSeconds()).slice(-2);
    return d + "/" + m + "/" + y + " " + h + ":" + mi + ":" + s;
  }
function display_float_textContent(ObjectID,value,dp,unit){
    let e = document.getElementById(ObjectID);
    if (e){
        e.textContent = parseFloat(value).toFixed(dp).toString() + " " + unit;
    }
}
function display_float_value(ObjectID,value,dp){
    let e = document.getElementById(ObjectID);
    if (e){
        e.value = parseFloat(value).toFixed(dp);
    }
}

function btnScreen_clicked(id){
    //console.log(id, 'clicked');
    document.getElementById('mainscreen').style.display = 'none';
    document.getElementById('chartscreen').style.display = 'none';
    document.getElementById('reportscreen').style.display = 'none';
    if (id === 'btn_mainscreen') document.getElementById('mainscreen').style.display = 'block';
    else if (id === 'btn_chartscreen') document.getElementById('chartscreen').style.display = 'block';
    else if (id === 'btn_reportscreen') document.getElementById('reportscreen').style.display = 'block';

    document.getElementById('btn_mainscreen').style.backgroundColor = 'gray';
    document.getElementById('btn_chartscreen').style.backgroundColor = 'gray';
    document.getElementById('btn_reportscreen').style.backgroundColor = 'gray';
    document.getElementById(id).style.backgroundColor = 'chartreuse';
}
function btn_clicked(id){
    //console.log(id, 'clicked');
    if (!plcconnected){
        alert('Mất kết nối đến PLC!');
    }
    //
    var tag = '';
    var writeValue = '';
    switch (id){
        case 'btn_auto':
            tag = 'AUTO_MODE';
            writeValue = true;
            break;
        case 'btn_manual':
            tag = 'AUTO_MODE';
            writeValue = false;
            break;
        case 'btn_start':
            tag = 'CMD_START';
            writeValue = true;
            break;
        case 'btn_stop':
            tag = 'CMD_STOP';
            writeValue = true;
            break;
        case 'ps-circle': //mô phỏng trạng thái pressure switch
            tag = 'PS_STATUS';
            writeValue = !plc_values[tag];
            break;
        case 'pumpicon': //mô phỏng trạng thái bơm
            tag = 'TEST_PUMP_FAULT';
            writeValue = true;
            /*tag = 'PUMP_STATUS';
            writeValue = plc_values[tag] + 1;
            if (writeValue > 2) writeValue = 0;
            */
            break; 
        case 'btn_setPT': //cài đặt áp suất
            tag = 'PRESSURE_SP';
            writeValue = document.getElementById('pressure_sp_new').value;
            break;
        case 'btn_reset':
            tag = 'CMD_RESET';
            writeValue = true;
            break;
    }
    if (tag !== ''){
        let cmd = "cmd_Write_to_PLC";
        let data = [tag,writeValue];
        socket.emit(cmd, data);
        console.log(cmd, data);
    }
}
var T2 = setInterval(flashTimer, 500);
var flashing = false;
function flashTimer() {
    flashing = !flashing;
}
function display_pump_status(ObjectID,data){
    let SymName = "pump";
    let imglink_ = "images/Symbol/" + SymName + "_.png"; // Trạng thái mất kết nối
    let imglink_0 = "images/Symbol/" + SymName + "_0.png"; // Trạng thái tag = 0
    let imglink_1 = "images/Symbol/" + SymName + "_1.png"; // Trạng thái tag = 1
    let imglink_2 = "images/Symbol/" + SymName + "_2.png"; // Trạng thái tag = 2
    if (data == 0)
    {
        document.getElementById(ObjectID).src = imglink_0;
    }
    else if (data == 1)
    {
        document.getElementById(ObjectID).src = imglink_1;
    }
    else if (data == 2)
    {
        if (flashing) document.getElementById(ObjectID).src = imglink_2;
        else document.getElementById(ObjectID).src = imglink_0;
    }
    else document.getElementById(ObjectID).src = imglink_;
}