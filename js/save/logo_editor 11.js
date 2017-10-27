/*
 * TODO
 *
 * Add options for strokeColor (add stops + first gradient color)
 * Synchroniser les Couleurs;
 * problème typo not loading
 *
 * OnFrame Event -> Animate bezier
 *
 * => API
 * => Mur de pensée
 * => Saving params value > https://workshop.chromeexperiments.com/examples/gui/#5--Saving-Values
 */

var logo_shape;
var gridPath,text;
var json_file = "bezier";
var dashIndice = 10;

var old_logo_shape = [
        ["0,1","0,2","0,3"],
  ["1,0","1,1","1,2","1,3","1,4"],
  ["2,0","2,1","2,2","2,3","2,4"],
  ["3,0","3,1","3,2","3,3","3,4"],
        ["4,1","4,2","4,3"]
];

var new_logo_shape = [
        ["0,1","0,2","0,3"],
  ["1,0","1,1","1,2","1,3","1,4"],
  ["2,0","2,1","2,2","2,3","2,4"],
        ["3,1","3,2","3,3"]
];

var test_logo_shape = [
        ["0,1","0,2","0,3"],
  ["1,0","1,1","1,2","1,3","1,4"],
  ["2,0","2,1","2,2","2,3","2,4"],
  ["3,0","3,1","3,2","3,3","3,4"],
  ["4,0","4,1","4,2","4,3","4,4"],
  ["5,0","5,1","5,2","5,3","5,4"],
  ["6,0","6,1","6,2","6,3","6,4"],
        ["7,1","7,2","7,3"]
];

logo_shape = new_logo_shape;

var logo_width,logo_height;

function logo_h(){
	logo_height = logo_shape.length-1;
	return logo_height
}
function logo_w(){
	var max_lenght = 0;
	for (var i=0; i < logo_shape.length; i++){
		if (max_lenght < logo_shape[i].length){
			max_lenght = logo_shape[i].length;
		}
	}
	logo_width = max_lenght-1;
	return logo_width;
}

var scale_index = 1,
	width_gap = 80,
	height_gap = 80,
	path_size = 14,
	w_margin = (window.innerWidth-width_gap*logo_w())/2,
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50,
	circle = false,
	grid_color = '#000000',
	first_stop_color = '#ffffff',
	display_grid = true;

var bezier,
	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1,
	nb_bezier_max = 100,
	smooth = 0,
	tension = true;
	smooth_height = (smooth/100)*height_gap,
	smooth_width = (smooth/100)*width_gap,
	strokeWidth = 15*scale_index,
	bezier_debug = false,
	strokeCap = 'square',
	blendMode = 'normal';

var save_rand_coord = new Array();

/**********************************************/

//DAT.GUI
var params = {
	form: 'new',
	scale: scale_index,
	width_gap : width_gap,
	height_gap: height_gap,
	path_size:  path_size,
	shape: 'square',
	color: grid_color,
	first_stop_color: first_stop_color,
	display_grid: display_grid,
	nb_bezier: nb_bezier,
	smooth: smooth,
	tension: tension,
	strokeWidth : strokeWidth,
	debug : bezier_debug,
	blendMode : blendMode,
	json : json_file,
	load: function(){load();},
	random: function(){randomize();},
	export: function(){export_logo();}
};

var gui = new dat.GUI();

var global_ = gui.addFolder('Global');
global_.add( params, 'scale', 0.1, 4).step( 0.1 ).onChange( function( value ) {
	scale_index = value;
	Update();
}).listen();
global_.addColor( params, 'color').onChange( function( value ) {
	grid_color = value;
	Update();
}).listen();
global_.addColor( params, 'first_stop_color').onChange( function( value ) {
	first_stop_color = value;
	Update();
}).listen();
global_.open();

var grid = gui.addFolder('Grid');
grid.add(params, 'form', [ 'new', 'old', 'custom'] ).onChange( function(value){
	if (params.form === 'old'){
		logo_shape = old_logo_shape;
	} else if (params.form === 'new') {
		logo_shape = new_logo_shape;
	} else if (params.form === 'custom') {
		logo_shape = test_logo_shape;
	}
	w_margin = (window.innerWidth-width_gap*logo_w())/2;
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50;
	new_array_coord();
	Update();
}).listen();
grid.add( params, 'width_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	width_gap = value;
	w_margin = (window.innerWidth-width_gap*logo_w())/2;
	Update();
}).listen();

grid.add( params, 'height_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	height_gap = value;
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50;
	Update();
}).listen();
grid.add( params, 'path_size', 1, 30 ).step( 1 ).onChange( function( value ) {
	path_size = value;
	Update();
}).listen();
grid.add(params, 'shape', [ 'square', 'circle'] ).onChange( function(value){
	circle = params.shape === 'circle' ? true : false;
	Update();
}).listen();
grid.add( params, 'display_grid').onChange( function( value ) {
	display_grid = value;
	Update();
}).listen();
grid.close();

var bezier = gui.addFolder('Bezier');
bezier.add(params, 'blendMode', ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source- over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'] ).onChange( function(value){
	blendMode = value;
	Update();
}).listen();
bezier.add( params, 'nb_bezier', 0, 100 ).step( 1 ).onChange( function( value ) {
	nb_bezier = value;
	Update();
}).listen();
bezier.add( params, 'smooth', 0, 100 ).step( 1 ).onChange( function( value ) {
	smooth = value;
	smooth_height = (value/100)*height_gap;
	smooth_width = (value/100)*width_gap;
	Update();
}).listen();
bezier.add( params, 'tension').onChange( function( value ) {
	tension = value;
	Update();
}).listen();
bezier.add( params, 'strokeWidth', 1, 31 ).step( 1 ).onChange( function( value ) {
	strokeWidth = value;
	Update();
}).listen();
bezier.add( params, 'debug').onChange( function( value ) {
	bezier_debug = value;
	Update();
}).listen();
bezier.open();
gui.add( params, 'json').onFinishChange( function( value ) {
	json_file = value;
	alert(json_file);
}).listen();
gui.add( params, 'load');
gui.add( params, 'random');
gui.add( params, 'export');

/**********************************************/

function randomize(){
	/*width_gap = Math.floor(Math.random() * (200 - 10 + 1)) + 10;	
	params.width_gap = width_gap;
	
	height_gap = Math.floor(Math.random() * (200 - 100 + 1)) + 10;
	params.height_gap = height_gap;*/
	
	path_size = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.path_size = path_size;
	
	circle = Math.random() >= 0.5;
	params.shape = circle == true ? "circle" : "square";
	
	first_stop_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	grid_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	//params.grid_color = grid_color;
	//console.log(params.grid_color);
	//la valeur est bien enregistrée mais ne mais pas à jour 'color' peut-être parse que .listen() n'existe pas pour addColor();
	
	/*colorController.onChange(function(value) {
	    colorController.__input.style.color = value;
	});*/
	
	smooth = Math.floor(Math.random() * (30 - -10 + 1)) + -10;
	params.smooth = smooth;
	
	strokeWidth = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
	params.strokeWidth = strokeWidth;
	
	w_margin = (window.innerWidth-width_gap*logo_w())/2;
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50;

	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.nb_bezier = nb_bezier;
	
	dashIndice=0;

	new_array_coord();	
	Update();
}

function randCoord(){
	var x = Math.floor(Math.random() * ((logo_shape.length-1) - 0 + 1)) + 0;
	var y = Math.floor(Math.random() * ((logo_shape[x].length-1) - 0 + 1)) + 0;
	return logo_shape[x][y];
}

/**********************************************/

//API

//var URL = window.location.href;
//?size=2&color=0aa0ff&load=bezier1

function api(){
	
	var qSize = getParameterByName('size');
	//scale_index = qSize!=null?qSize:scale_index;

	/***** GET COLOR ******/
	var qColor = getParameterByName('color');

	if(qColor!=null){
		if(/^#/i.test(qColor)){
			if(/^#[0-9A-F]{6}$/i.test(qColor)){
				grid_color=qColor;
			}
		} else {
			if(/^#[0-9A-F]{6}$/i.test('#'+qColor)){
				grid_color="#"+qColor;
			}
		}
	}	
	/***** END : GET COLOR ******/

	//query('color',grid_color);

	//var queryJson = getParameterByName('json');
}

/*function query(type,to){
	var q = getParameterByName(type);
	grid_color = q!=null?q:qrid_color;
}*/

/********* API PARAMS ************** 
		
	//1er
	scale : float
	grid_color : color
	load : string [JSON]
	
	//2e
	blendMode : string []
	strokeWidth : int
	path_size : int
	first_stop_color : color
	shape : string ['square','circle']
	
	//3e
	form : String ['new','old','custom']
	width_gap : int
	height_gap : int
	display_grid : boolean
	nb_bezier : int
	smooth : int
	tension : boolean

********** API PARAMS ***************/

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

/**********************************************/

//INIT
window.load = Init();

//RESIZE CLIENT
window.onresize = function() {
	w_margin = (window.innerWidth-width_gap*logo_w())/2;
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50;
	Update();
};

function Init(){

	api();

	new_array_coord();
	Update();
	//draw_typo();

	//http://api.mentalista.fr/logo?w=200
	//svg_to_uri();
};

function Update(){
	project.activeLayer.removeChildren();

	for(var i=0; i<nb_bezier; i++){
		draw_bezier(save_rand_coord[i][0],save_rand_coord[i][1],save_rand_coord[i][2]);
	}

	if (display_grid == true){
		draw_grid();
	}
	draw_typo();

	project.activeLayer.scale(scale_index);
};

function onFrame(event) {
	//console.log(event.count);
	//console.log(event.time);
	//console.log(event.delta);
	
	//TODO animate bezier
	//desactiver la fonction ?

	dashIndice=dashIndice+3;
	smooth++;
	Update();

	
	/*
	requestAnimationFrame(update);
 	fizzyText.noiseStrength = Math.cos(Date.getTime());

  	// Iterate over all controllers
  	for (var i in gui.__controllers) {
    	gui.__controllers[i].updateDisplay();
  	}
  	*/
}

/**********************************************/

function new_array_coord(){
	//Amélioration : détecter les béziers qui sont sur le même point
	for(var i=0; i<nb_bezier_max; i++){
		save_rand_coord.push(new Array());
		for(var j=0; j<2; j++){
			save_rand_coord[i][j] = randCoord();
		}
		var orientation = Math.random() >= 0.5 ? 0 : 1;
		save_rand_coord[i][2] = orientation;
	}
}

function draw_grid(){
	var path = new Path.Rectangle({
		point: [0,0],
		size: [path_size, path_size],
		fillColor: grid_color,
		strokeColor: grid_color
	});

	for(var i = 0; i < logo_shape.length; i++) {
		for(var j = 0; j < logo_shape[i].length; j++) {
			
			var coord = logo_shape[i][j];
			var coord = coord.split(",");

			gridPath = path.clone();
			if(circle == true){
				gridPath.smooth({ type: 'continuous' });
			}

			gridPath.position = new Point(w_margin+width_gap*coord[1], h_margin+height_gap*coord[0]);
		}
	}
	path.remove();
	
	//console.log(gridPath);
	//console.log("width : "+width_gap*coord[1]+" height :"+height_gap*coord[0]);
}

function draw_typo(){
	//Load mentalista.svg
	var logo_margin_top = 87;
	var marge_sup = 27;
	
	/*var typo = paper.project.importSVG("svg/mentalista.svg", function(item) {
		item.position = new Point(w_margin+width_gap*(logo_w()/2), h_margin+height_gap*logo_h()+logo_margin_top);
	});*/
		
	//TODO add typo
	text = new PointText({
	    point: [w_margin+width_gap*(logo_w()/2), h_margin+height_gap*logo_h()+logo_margin_top+marge_sup],
	    content: 'mentalista',
	    fillColor: grid_color,
	    fontFamily: 'Mentalista Grotesque',
	    fontWeight: 'normal',
	    justification : 'center',
	    fontSize: 85
	});
}

function load(){

	//TODO load curve from .json

	var url = "json/";
	var file_name = json_file;
	var nbFiles = 1;
	
	//problème de cache lié à l'url de charge

	for(var i=1; i<=nbFiles; i++){
		$.ajax({url: url+file_name+".json",cache:false,dataType:"json"})
			.fail(function(){alert("fail loading : "+file_name+".json");})
			.done(function(data){
			
			var loadedData = data;
			console.log(loadedData);
			
			//project.importJSON(JSON.stringify(jsonData));
			
			//var newDataset = {
	        //	label: [],
            //    fill: false,
			//	borderColor : 	   'rgba(20,'+ color +',20,1)',
			//	pointBorderColor : 'rgba(0,0,0,0)',
			//	backgroundColor :  'rgba(0,0,0,0)',
			//	lineTension: 0.1,
	        //	data: []
	        //};
			
			//for(var j=0; j<loadedData.Pattern.length; j++){
			//	newDataset.data.push(loadedData.Pattern[j].FFT_uV);
			//	config.data.labels.push(loadedData.Pattern[j].FFT_Hz);
			//}

			for(var a=0; a<loadedData.bezier.length; a++){
				
				save_rand_coord.push(new Array());
				
				save_rand_coord[a][0] = loadedData.bezier[a].p1
				save_rand_coord[a][1] = loadedData.bezier[a].p2
				save_rand_coord[a][2] = loadedData.bezier[a].orientation
			}
			
			nb_bezier = loadedData.bezier.length;
			params.nb_bezier = nb_bezier;
			
			Update();
			
			//newDataset.label.push(myData.ID[0].name + " Channel: " + myData.ID[0].Channel);
			//newDataset.label.push("Channel " + loadedData.ID[0].Channel);
			
		});
	};
}

function svg_to_uri(){
	var svg_to_uri = project.exportSVG({ asString: true });
	$("body").text(svg_to_uri);
	
	//manque la typo ->
}

function export_logo(){
	var d = new Date();
	
	//desactiver les dash
	dashIndice = null;
	Update();

	var svg = project.exportSVG({ asString: true });	
	downloadDataURI({
		data: 'data:image/svg+xml;base64,' + btoa(svg),
		filename: 'mentalista_'+d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear()+'.svg'
	});
}

//À nettoyer
function draw_bezier(p1,p2,orientation){
	
	var coord1 = p1.split(",");
	var coord2 = p2.split(",");
	
	var handleIn,handleOut;
	
	var bezierX = coord1[1]-coord2[1];
	var bezierY = coord1[0]-coord2[0];

	var process_bezierX = 1;
	var process_bezierY = 1;

	if(tension == true){
		process_bezierX = Math.abs(bezierX);
		process_bezierY = Math.abs(bezierY);
	}

	if (bezierX > 0){
		//console.log("direction du bezier : <----");
		
		if (bezierY > 0){
			//console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0, height_gap*process_bezierY-smooth_height);
				handleOut = new Point(-width_gap*process_bezierX+smooth_width, 0);
			} else {
				handleIn = new Point(width_gap*process_bezierX-smooth_width,0);
				handleOut = new Point(0,-height_gap*process_bezierY+smooth_height);
			}
		} else if (bezierY < 0){
			//console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap*process_bezierY-smooth_height);
				handleIn = new Point(width_gap*process_bezierX-smooth_width, 0);
			} else {
				handleOut = new Point(-width_gap*process_bezierX+smooth_width,0);
				handleIn = new Point(0,-height_gap*process_bezierY+smooth_height);
			}
		} else if (bezierY == 0){
			//console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
		
	} else if (bezierX < 0){
		//console.log("direction du bezier : ---->");
		
		if (bezierY > 0){
			//console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0,height_gap*process_bezierY-smooth_height);
				handleOut = new Point(width_gap*process_bezierX-smooth_width,0);
			} else {
				handleIn = new Point(-width_gap*process_bezierX+smooth_width, 0);
				handleOut = new Point(0, -height_gap*process_bezierY+smooth_height);
			}
		} else if (bezierY < 0){
			//console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap*process_bezierY-smooth_height);
				handleIn = new Point(-width_gap*process_bezierX+smooth_width, 0);
			} else {
				handleOut = new Point(width_gap*process_bezierX-smooth_width, 0);
				handleIn = new Point(0, -height_gap*process_bezierY+smooth_height);
			}
		} else if (bezierY == 0){
			//console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
	} else if (bezierX == 0) {
		/*console.log("direction du bezier : Static");
		
		if (bezierY > 0){
			//console.log("direction du bezier : monte");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (bezierY < 0){
			//console.log("direction du bezier : descend");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (bezierY == 0){
			//console.log("direction du bezier : static");*/
			handleIn = p1_point;
			handleOut = p2_point;
		//}
	}
	
	var p1_point = new Point(
		w_margin+width_gap*parseInt(coord1[1]),
		h_margin+height_gap*parseInt(coord1[0])
	);
	var p1_segment = new Segment(p1_point, null, handleOut);

	var p2_point = new Point(
		w_margin+width_gap*parseInt(coord2[1]),
		h_margin+height_gap*parseInt(coord2[0])
	);
	var p2_segment = new Segment(p2_point, handleIn, null);

	bezier = new Path(p1_segment, p2_segment);

	//var randomStop = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);

	bezier.strokeColor = {
		gradient: {
			stops: [first_stop_color, grid_color]
		},
		origin: p1_point,
		destination: p2_point
	};
	
	//bezier.strokeColor.gradient.stops[0].color.alpha = 0.0

	bezier.blendMode = blendMode;

	bezier.strokeWidth = strokeWidth*scale_index;
	
	if(circle == true){
		bezier.strokeCap = 'round';
	} else {
		bezier.strokeCap = 'square';
	}

	//bezier.dashOffset = dashIndice;
	bezier.dashArray = [dashIndice,400];

	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}