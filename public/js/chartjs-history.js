var timeFormat_2 = 'yyyy-MM-dd HH:mm:ss';
var dragOptions_2 = {
		animationDuration: 600
	};

class Custom_2 extends Chart.controllers.line {
    draw () {
	  Chart.controllers.line.prototype.draw.call(this);
		
	  if (this.chart.tooltip._active && this.chart.tooltip._active.length > 0) {
		// console.log(this.chart.tooltip._active[0]);
		
		 var activePoint = this.chart.tooltip._active[0],
			ctx_2 = this.chart.ctx_2,
			 x = activePoint.element.x,
			 topY = this.chart.scales['y'].top,
			 bottomY = this.chart.scales['y'].bottom;		
		 // draw line
		 ctx_2.save();
		 ctx_2.beginPath();
		 ctx_2.moveTo(x, topY);
		 ctx_2.lineTo(x, bottomY);
		 ctx_2.lineWidth = 1;
		 ctx_2.strokeStyle = '#07C';
		 ctx_2.stroke();
		 ctx_2.restore();
	  }
   }
};
Custom_2.id = 'LineWithLine';
Custom_2.defaults = Chart.controllers.line.defaults;
Chart.register(Custom_2);

const line_time_2 = {
	parser: timeFormat_2,
	//round: 'minute',
	tooltipFormat: 'DD/MM/YYYY HH:mm:ss', //'ll HH:mm'
	displayFormats: {
		minute: 'HH:mm:ss',
		hour: 'h A',
		day: 'DD/MM'
	},
	minUnit: 'minute',
};

const lineTension_default_2 = 0.4;
const randomColor_2 = "#" + Math.floor(Math.random()*16777215).toString(16);
const colors_arr_2 = ['blue','green','#880015','#ED1C24','#FF7F27','#000000','#7F7F7F','#3F48CC','#B97A57','#FFAEC9','#99D9EA','#7092BE'];

const channel_name = {
	apsuat_dat: "Áp suất đặt (bar)", 
	apsuat_chay: "Áp suất thực (bar)",
	tanso: "Tần số (Hz)",
	dongdien: "Dòng điện (A)",
	congsuat: "Công Suất (kW)"
};
const config_2 = {
		type: 'line', //edit from update_chart
		
		data: {
            labels: [0],
            datasets: [
			{
				label: 'test',
				fill: false,
				pointRadius: 1,
				pointHoverRadius: 6,
				borderWidth: 3,
				lineTension: lineTension_default_2,
				data: [],				
			}
        ]
        },
		options: {
			responsive: true,
			  scales: {
				 x: {
					type: 'time',
					time: line_time_2,
					scaleLabel: {
						display: false,
					},
					ticks: {
						//autoskip: true,
						//autoSkipPadding: 3,
						minRotation: 45,
						maxRotation: 45,
						source: 'labels',
					},
					grid: {
					  display: true,
					  drawOnChartArea: true,
					  drawTicks: false,
					},
				},
				
				 y: 
					{					
					//suggestedMax: 3,
					//beginAtZero: true,
					display: true,
					boderColor: colors_arr_2[1],
					position: 'left',
					grace: '5%'
				 },
				 y1: {
					//suggestedMax: 30,
					//beginAtZero: true,					   
					boderColor: colors_arr_2[0], //fontColor
					position: 'right',
					display: false,
					grace: '5%',
					gridLines: {
							drawOnChartArea: false,
						}
				 }
				 
			  },
			  hover: {
				animationDuration: 0
			},
		   animation: {
				  duration: 500,
				  easing: 'linear',
				  y: {
					  duration: 0 
					},
			},				
		   },
		   //plugins: [plugin],
	};

var ctx_2 = null;
var ctx_2_div = 'ctx2';
window.myChart_2 = null;

function number_format_2(number, decimals, dec_point, thousands_sep) {
// *     example: number_format_2(1234.56, 2, ',', ' ');
// *     return: '1 234,56'
	number = (number + '').replace(',', '').replace(' ', '');
	var n = !isFinite(+number) ? 0 : +number,
			prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
			sep = (typeof thousands_sep === 'undefined') ? ',' : thousands_sep,
			dec = (typeof dec_point === 'undefined') ? '.' : dec_point,
			s = '',
			toFixedFix = function (n, prec) {
				var k = Math.pow(10, prec);
				return '' + Math.round(n * k) / k;
			};
	// Fix for IE parseFloat(0.55).toFixed(0) = 0;
	s = (prec ? toFixedFix(n, prec) : '' + Math.round(n)).split('.');
	if (s[0].length > 3) {
		s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
	}
	if ((s[1] || '').length < prec) {
		s[1] = s[1] || '';
		s[1] += new Array(prec - s[1].length + 1).join('0');
	}
	return s.join(dec);
}
var chs_2 = 'sp|pv';
var dataobj_2 = {};

function draw_Chart_2(data,chs)
{
	chs_2 = chs;
	dataobj_2 ={
		"labels": [
		],
		"col": 1,
		"x": [],
		"y": []
	};
	//thoigian,apsuat_dat
	var chx = chs_2.split(',');
	for(let i=0; i < chx.length; i++){
		dataobj_2.labels.push(channel_name[chx[i]]);
	}
	data.forEach(obj => {
		let dt = obj['thoigian'];
		let lbl = Date.parse(dt.replace(" ","T"))
		dataobj_2.x.push(lbl);
		for(let i=0; i < chx.length; i++){
			if (dataobj_2.y[i] === undefined) dataobj_2.y[i] = [];
			dataobj_2.y[i].push(obj[chx[i]]);
		}
		
	});
	//console.log(dataobj_2)
	update_chart_config_2(dataobj_2);
}
function update_chart_config_2(obj)
{
	try{
		var chx = chs_2.split(',');
		config_2.data.labels = [0];
		config_2.data.datasets.forEach(function(dataset, datasetIndex) {
			config_2.data.datasets[datasetIndex].data = [];
		});
		
		let des_length = obj.labels.length;
		config_2.options.scales['y'].beginAtZero = true;
			
		config_2.type = 'LineWithLine';
		config_2.options.scales['x'].time = line_time_2;
		
		if (des_length < config_2.data.datasets.length)
		{
			//remove dataset
			var id = config_2.data.datasets.length - 1;
			while (id >= des_length) config_2.data.datasets.splice(id--, 1);
		}
		cl = colors_arr_2[0];
		config_2.data.datasets[0].borderColor = cl; //borderColor
		config_2.data.datasets[0].backgroundColor = cl;
		
		while (des_length > config_2.data.datasets.length)
		{
			//add dataset
			var len = config_2.data.datasets.length;
			if (chx[len] == "sp") newColor = 'orange';
			else if (len < colors_arr_2.length) newColor = colors_arr_2[len];
			else newColor = randomColor_2;
			var newDataset = {
				label: 'Dataset ' + config_2.data.datasets.length,
				borderColor: newColor,
				backgroundColor: newColor,
				fill: false,
				pointRadius: config_2.data.datasets[0].pointRadius,
				pointHoverRadius: config_2.data.datasets[0].pointHoverRadius,
				borderWidth: config_2.data.datasets[0].borderWidth,
				lineTension: config_2.data.datasets[0].lineTension,
				data: [],
			};

			config_2.data.datasets.push(newDataset);
		}
		for (var index = 0; index < config_2.data.datasets.length; index++) {
			config_2.data.datasets[index].label = obj.labels[index];
		}
		
		config_2.data.labels = obj.x;
			
		for (var idx = 0; idx < config_2.data.datasets.length; idx++) {
			config_2.data.datasets[idx].data = obj.y[idx];		
		}	
		//if (config_2.data.datasets.length > 1)		
		if (obj.col == 2)
		{
			config_2.options.scales['y1'].display = true;
			config_2.data.datasets[1].yAxisID = 'y1';
		}
		else 
		{
			config_2.options.scales['y1'].display = false;
		}
		
	}
	catch(e)
	{
		console.log(e);
		config_2.data.labels = [0];
		config_2.data.datasets.forEach(function(dataset, datasetIndex) {
			config_2.data.datasets[datasetIndex].data = [];
			config_2.data.datasets[datasetIndex].label = 'Lỗi đồ thị';
		});
	}
	if (config_2.data.labels.length === 0) config_2.data.labels = [0];
	
	config_2.data.datasets.forEach(function(dataset, datasetIndex) {		
		config_2.data.datasets[datasetIndex].lineTension = lineTension_default_2;
	});
		
	if(window.myChart_2 === null)
	{
		var canvas=document.getElementById(ctx_2_div);
		if (!canvas) {
			console.log("canvas?",ctx_2_div)
			return;
		}
		ctx_2 = canvas.getContext("2d");
		window.myChart_2 = new Chart(ctx_2,config_2);
	}
	else 
	{
		window.myChart_2.config_2 = config_2;
		window.myChart_2.update();
	}
}
function destroy_chart_2()
{
	if(window.myChart_2 !== null)
	{
		window.myChart_2.destroy();
		//window.myChart_2 = null;
	}
}