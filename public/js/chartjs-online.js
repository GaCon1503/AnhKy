var timeFormat = 'yyyy-MM-dd HH:mm:ss';
var dragOptions = {
		animationDuration: 600
	};

class Custom extends Chart.controllers.line {
    draw () {
	  Chart.controllers.line.prototype.draw.call(this);
		
	  if (this.chart.tooltip._active && this.chart.tooltip._active.length > 0) {
		// console.log(this.chart.tooltip._active[0]);
		
		 var activePoint = this.chart.tooltip._active[0],
			ctx = this.chart.ctx,
			 x = activePoint.element.x,
			 topY = this.chart.scales['y'].top,
			 bottomY = this.chart.scales['y'].bottom;		
		 // draw line
		 ctx.save();
		 ctx.beginPath();
		 ctx.moveTo(x, topY);
		 ctx.lineTo(x, bottomY);
		 ctx.lineWidth = 1;
		 ctx.strokeStyle = '#07C';
		 ctx.stroke();
		 ctx.restore();
	  }
   }
};
Custom.id = 'LineWithLine';
Custom.defaults = Chart.controllers.line.defaults;
Chart.register(Custom);

const line_time = {
	parser: timeFormat,
	//round: 'minute',
	tooltipFormat: 'DD/MM/YYYY HH:mm:ss', //'ll HH:mm'
	displayFormats: {
		minute: 'HH:mm:ss',
		hour: 'h A',
		day: 'DD/MM'
	},
	minUnit: 'minute',
};

const lineTension_default = 0.4;
const randomColor = "#" + Math.floor(Math.random()*16777215).toString(16);
const colors_arr = ['blue','green','#880015','#ED1C24','#FF7F27','#000000','#7F7F7F','#3F48CC','#B97A57','#FFAEC9','#99D9EA','#7092BE'];
const config = {
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
				lineTension: lineTension_default,
				data: [],				
			}
        ]
        },
		options: {
			responsive: true,
			  scales: {
				 x: {
					type: 'time',
					time: line_time,
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
					boderColor: colors_arr[1],
					position: 'left',
					grace: '5%'
				 },
				 y1: {
					//suggestedMax: 30,
					//beginAtZero: true,					   
					boderColor: colors_arr[0], //fontColor
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
				  duration: 5000,
				  easing: 'linear',
				  y: {
					  duration: 0 
					},
			},				
		   },
		   //plugins: [plugin],
	};

var ctx = null;
var ctx_div = 'ctx1';
window.myChart1 = null;

function number_format(number, decimals, dec_point, thousands_sep) {
// *     example: number_format(1234.56, 2, ',', ' ');
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
var chs = 'sp|pv';
var dataobj = {};
const datapoint_max = 100;

function Add_Chart_Point(sp,pv){
	if(window.myChart1 === null) return;
	
	let lbl = new Date().getTime();
	if (config.data.labels.length < datapoint_max){
		config.data.labels.push(lbl);
		config.data.datasets[0].data.push(sp);
		config.data.datasets[1].data.push(pv);
		window.myChart1.update();
		return;
	}
	config.data.labels.push(lbl);
	config.data.labels.splice(0,1);

	config.data.datasets[0].data.splice(0,1);
	config.data.datasets[0].data.push(sp);
	config.data.datasets[1].data.splice(0,1);
	config.data.datasets[1].data.push(pv);
	window.myChart1.update();
}
function random_data(){
	let data_count = datapoint_max;
	dataobj.x = [];
	dataobj.y = [];
	dataobj.y[0] = [];
	dataobj.y[1] = [];
	let ts = new Date().getTime();
	ts -= data_count*1000; //100 mẫu
	for (let i = 0; i < data_count; i ++){
		dataobj.x[i] = ts + i*1000;
		dataobj.y[0][i] = 2.5; //sp
		let rnd = Math.floor(Math.random() * 10)*0.1;
		dataobj.y[1][i] = 2.5 + (0.5 - rnd);
	}
}
function draw_Chart()
{
	dataobj ={
		"labels": [
			"Áp suất đặt (bar)", "Áp suất thực (bar)"
		],
		"col": 1,
		"x": [],
		"y": [
			[]
		]
	};
	random_data();
	update_chart_config(dataobj);
}
function update_chart_config(obj)
{
	try{
		var chx = chs.split('|');
		config.data.labels = [0];
		config.data.datasets.forEach(function(dataset, datasetIndex) {
			config.data.datasets[datasetIndex].data = [];
		});
		
		let des_length = obj.labels.length;
		config.options.scales['y'].beginAtZero = true;
			
		config.type = 'LineWithLine';
		config.options.scales['x'].time = line_time;
		
		if (des_length < config.data.datasets.length)
		{
			//remove dataset
			var id = config.data.datasets.length - 1;
			while (id >= des_length) config.data.datasets.splice(id--, 1);
		}
		
		if (chx[0] == "sp") cl = 'orange';
		else cl = colors_arr[0];
		config.data.datasets[0].borderColor = cl; //borderColor
		config.data.datasets[0].backgroundColor = cl;
		
		while (des_length > config.data.datasets.length)
		{
			//add dataset
			var len = config.data.datasets.length;
			if (chx[len] == "sp") newColor = 'orange';
			else if (len < colors_arr.length) newColor = colors_arr[len];
			else newColor = randomColor;
			var newDataset = {
				label: 'Dataset ' + config.data.datasets.length,
				borderColor: newColor,
				backgroundColor: newColor,
				fill: false,
				pointRadius: config.data.datasets[0].pointRadius,
				pointHoverRadius: config.data.datasets[0].pointHoverRadius,
				borderWidth: config.data.datasets[0].borderWidth,
				lineTension: config.data.datasets[0].lineTension,
				data: [],
			};

			config.data.datasets.push(newDataset);
		}
		for (var index = 0; index < config.data.datasets.length; index++) {
			config.data.datasets[index].label = obj.labels[index];
		}
		
		config.data.labels = obj.x;
			
		for (var idx = 0; idx < config.data.datasets.length; idx++) {
			config.data.datasets[idx].data = obj.y[idx];		
		}	
		//if (config.data.datasets.length > 1)		
		if (obj.col == 2)
		{
			config.options.scales['y1'].display = true;
			config.data.datasets[1].yAxisID = 'y1';
		}
		else 
		{
			config.options.scales['y1'].display = false;
		}
		
	}
	catch(e)
	{
		console.log(e);
		config.data.labels = [0];
		config.data.datasets.forEach(function(dataset, datasetIndex) {
			config.data.datasets[datasetIndex].data = [];
			config.data.datasets[datasetIndex].label = 'Lỗi đồ thị';
		});
	}
	if (config.data.labels.length === 0) config.data.labels = [0];
	
	config.data.datasets.forEach(function(dataset, datasetIndex) {		
		config.data.datasets[datasetIndex].lineTension = lineTension_default;
	});
		
	if(window.myChart1 === null)
	{
		var canvas=document.getElementById(ctx_div);
		if (!canvas) {
			console.log("canvas?",ctx_div)
			return;
		}
		ctx = canvas.getContext("2d");
		window.myChart1 = new Chart(ctx,config);
	}
	else 
	{
		window.myChart1.config = config;
		window.myChart1.update();
	}
}
function destroy_chart1()
{
	if(window.myChart1 !== null)
	{
		window.myChart1.destroy();
		//window.myChart1 = null;
	}
}