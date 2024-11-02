var report_selected = "";
var channel_selected = "";
$(function() {
    let dt_from = document.getElementById('chart_from').value;
    if (dt_from == ''){        
        let dt_select_from = get_dtime(-3600*1000); //24*3600*1000
        let dt_select_to = get_dtime();
        document.getElementById('chart_from').value = dt_select_from;
        document.getElementById('report_from').value = dt_select_from;
        document.getElementById('chart_to').value = dt_select_to;
        document.getElementById('report_to').value = dt_select_to;
       // console.log(dt_select_from,dt_select_to)
    }
});
function get_dtime(ts = 0){
    let date = new Date();
    if (ts > 0) date = new Date(ts);
    else if (ts < 0){
        let time = date.getTime();
        time += ts;
        date = new Date(time);
    }
    let d = ("0" + date.getDate()).slice(-2);
    let m = ("0" + (date.getMonth()+1)).slice(-2);
    let y = date.getFullYear();
    let h = ("0" + date.getHours()).slice(-2);
    let mi = ("0" + date.getMinutes()).slice(-2);
    return y + "-" + m + "-" + d + "T" + h + ":" + mi;
}
function btn_report_clicked(id){
    //console.log(id)
    report_selected = id;
    if (id === 'btn_chart_history'){
        let dt_from = document.getElementById('chart_from').value;
        let dt_to = document.getElementById('chart_to').value;
        channel_selected = document.getElementById('select_param').value;
        if (dt_from == '' || dt_to == ''){
            alert("Chưa chọn thời gian!")
            return;
        }
        let cmd = "get_Report";
        let data = [dt_from,dt_to,channel_selected];
        socket.emit(cmd, data);
        //console.log(cmd, data);
    }
    else if (id === 'btn_report_history'){
        let dt_from = document.getElementById('report_from').value;
        let dt_to = document.getElementById('report_to').value;
        if (dt_from == '' || dt_to == ''){
            alert("Chưa chọn thời gian!")
            return;
        }
        //2024-10-01T23:39, 2024-10-02T23:39
        let cmd = "get_Report";
        let chs = "";
        let data = [dt_from,dt_to,chs];
        socket.emit(cmd, data);
        //console.log(cmd, data);        
    }
}
socket.on("Report_Data",function(data){
    //console.log(data)
    if (report_selected === 'btn_chart_history') draw_Chart_2(data,channel_selected);
    else if (report_selected === 'btn_report_history') Show_data_to_table(data);
});
//hiển thị dữ liệu lên bảng 
function Show_data_to_table(data){
    $("#table_01 tbody").empty();
    var txt = "<tbody>"
    var data_count = 0;
    data.forEach(arr => {
        data_count++;
        txt += "<tr><td>" + arr['thoigian'] + "</td>"
            + "<td>" + arr['apsuat_dat'] + "</td>"
            + "<td>" + arr['apsuat_chay'] + "</td>"
            + "<td>" + arr['tanso'] + "</td>"
            + "<td>" + arr['dongdien'] + "</td>"
            + "<td>" + arr['congsuat'] + "</td>"
            + "</tr>";
    });
    if (data_count === 0) txt += "<tr><td colspan='6' style='text-align: center;'>Không có dữ liệu</td></tr>"
    txt += "</tbody>";
     $("#table_01").append(txt);
}