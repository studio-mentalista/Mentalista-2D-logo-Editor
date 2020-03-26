/* ----------------------------------------------------------------------------------------------------
 * Mentalista Logo Editor, 2017
 * Created: 16/09/17 by Bastien DIDIER
 * 
 * Mentalista logo generation interface
 * https://lab.mentalista.fr/logo/2d/logo_editor.html
 *
 * TODO
 * Typography vectorization for export
 * Animation Export (webm/gif)
 * Speed + Animation type [easeIn]
 *
 * Update: 03/26/20 Current V.1.1
 * ----------------------------------------------------------------------------------------------------
 */

var canvas = document.getElementById('logoCanvas');

var logo_shape;
var gridPath,text;
var json_file = "test.json";
var dashIndice = 0;

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
	path_size = 15,
	w_margin = (window.innerWidth-width_gap*logo_w())/2,
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50,
	circle = false,
	background_color = '#ffffff',
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
	strokeWidth = path_size*scale_index,
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
	background: background_color,
	color: grid_color,
	first_stop_color: first_stop_color,
	display_grid: display_grid,
	nb_bezier: nb_bezier,
	smooth: smooth,
	tension: tension,
	strokeWidth : strokeWidth,
	debug : bezier_debug,
	blendMode : blendMode,
	reset: function(){resetAnimation();},
	json : json_file,
	load: function(){load();},
	random_data: function(){random_data();},
	random: function(){randomize();},
	render: function(){export_animation();},
	export: function(){export_logo();}
};

var gui = new dat.GUI();

var global_ = gui.addFolder('Global');
global_.add( params, 'scale', 0.1, 4).step( 0.1 ).onChange( function( value ) {
	scale_index = value;
	Update();
}).listen();
global_.addColor( params, 'background').onChange( function( value ) {
	background_color = value;
	canvas.style.backgroundColor = background_color;
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
	//problème Height quand size est > 1
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

var animation = gui.addFolder('Animation');
animation.add( params, 'reset');
animation.add( params, 'render');
animation.open();

var dataFolder = gui.addFolder('Data');
dataFolder.add( params, 'json').onFinishChange( function( value ) {
	json_file = value;
	alert(json_file);
}).listen();
dataFolder.add( params, 'load');
dataFolder.add( params, 'random_data');
dataFolder.open();

gui.add( params, 'random');
gui.add( params, 'export');

/**********************************************/

function randomize(){
	
	//uncomment if you want to randomize the logo width
	//width_gap = Math.floor(Math.random() * (200 - 10 + 1)) + 10;	
	//params.width_gap = width_gap;
	
	//uncomment if you want to randomize the logo height
	//height_gap = Math.floor(Math.random() * (200 - 100 + 1)) + 10;
	//params.height_gap = height_gap;
	
	//w_margin = (window.innerWidth-width_gap*logo_w())/2;
	//h_margin = (window.innerHeight-height_gap*logo_h())/2-50;

	path_size = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.path_size = path_size;
	
	circle = Math.random() >= 0.5;
	params.shape = circle == true ? "circle" : "square";
	
	first_stop_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	params.first_stop_color = first_stop_color;

	grid_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	params.color = grid_color;
	
	smooth = Math.floor(Math.random() * (30 - 10 + 1)) + 10;
	params.smooth = smooth;
	
	strokeWidth = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
	params.strokeWidth = strokeWidth;

	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.nb_bezier = nb_bezier;
	
	dashIndice=0;

	new_array_coord();
	Update();
}

function random_data(){
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
//?size=2&color=0aa0ff&load=test.json

//function api(){
//	
//	var qSize = getParameterByName('size');
//	//scale_index = qSize!=null?qSize:scale_index;
//
//	/***** GET COLOR ******/
//	var qColor = getParameterByName('color');
//
//	if(qColor!=null){
//		if(/^#/i.test(qColor)){
//			if(/^#[0-9A-F]{6}$/i.test(qColor)){
//				grid_color=qColor;
//			}
//		} else {
//			if(/^#[0-9A-F]{6}$/i.test('#'+qColor)){
//				grid_color="#"+qColor;
//			}
//		}
//	}	
//	/***** END : GET COLOR ******/
//
//	//query('color',grid_color);
//
//	//var queryJson = getParameterByName('json');
//}

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

//function getParameterByName(name, url) {
//    if (!url) url = window.location.href;
//    name = name.replace(/[\[\]]/g, "\\$&");
//    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
//        results = regex.exec(url);
//    if (!results) return null;
//    if (!results[2]) return '';
//    return decodeURIComponent(results[2].replace(/\+/g, " "));
//}

/**********************************************/

//function svg_to_uri(){
//	var svg_to_uri = project.exportSVG({ asString: true });
//	$("body").text(svg_to_uri);	
	//manque la typo ?
//}

//INIT
window.load = Init();

//RESIZE CLIENT
window.onresize = function() {
	w_margin = (window.innerWidth-width_gap*logo_w())/2;
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50;
	Update();
};

function Init(){

	//api();

	new_array_coord();
	Update();
	//draw_typo();

	//http://api.mentalista.fr/logo?color=aeff00&size=2
	//TODO desactiver les dashs
	//dashIndice = null;
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

	dashIndice=dashIndice+3;
	smooth++;
	Update();	
}

function resetAnimation(){dashIndice=10;}

/**********************************************/

function new_array_coord(){

	save_rand_coord.length = 0

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
		fillColor: grid_color
	});

	for(var i = 0; i < logo_shape.length; i++) {
		for(var j = 0; j < logo_shape[i].length; j++) {
			var coord = logo_shape[i][j].split(",");
			//var coord = coord.split(",");
			gridPath = path.clone();
			if(circle == true){
				gridPath.smooth({ type: 'continuous' });
			}
			gridPath.position = new Point(w_margin+width_gap*coord[1], h_margin+height_gap*coord[0]);
		}
	}
	path.remove();
}

function draw_typo(){
	//var typo = paper.project.importSVG("font/mentalista_grotesque/logo_typo-mentalista.svg", function(item) {
	//	item.position = new Point(w_margin+width_gap*(logo_w()/2), h_margin+height_gap*logo_h()+logo_margin_top);
	//});

	var logo_margin_top = 114;

	text = new PointText({
		point: [w_margin+width_gap*(logo_w()/2), h_margin+height_gap*logo_h()+logo_margin_top],
		content: 'mentalista',
		fillColor: grid_color,
		fontFamily: 'Mentalista Grotesque',
		fontWeight: 'normal',
		justification : 'center',
		fontSize: 85
	});
}

function load(){
	$.ajax({
		url: "data/"+json_file,
		cache:false,
		dataType:"json"
	})
	.fail(function(){alert("fail loading : "+json_file);})
	.done(function(data){

		//console.log(data);
		
		nb_bezier = data.bezier.length;
		params.nb_bezier = nb_bezier;

		save_rand_coord.length = 0;

		for(var i=0; i < nb_bezier; i++){
			save_rand_coord.push(new Array());
			save_rand_coord[i][0] = data.bezier[i][0];
			save_rand_coord[i][1] = data.bezier[i][1];
			save_rand_coord[i][2] = data.bezier[i][2];
		}

		path_size = data.config.path_size;
		params.path_size = data.config.path_size;

		circle = data.config.shape === 'circle' ? true : false;
		params.shape = data.config.shape;

		first_stop_color = data.config.first_stop_color;
		params.first_stop_color = data.config.first_stop_color;

		grid_color = data.config.grid_color;
		params.color = data.config.grid_color;

		strokeWidth = data.config.strokeWidth;
		params.strokeWidth = data.config.strokeWidth;

		dashIndice = 0;
		Update();		
	});
}

function export_animation(){
	alert('TODO');
	//resetAnimation();
}

function export_logo(){
	var d = new Date();
	
	//deactivate dashs
	dashIndice = null;
	Update();

	var svg = project.exportSVG({ asString: true });

	var dataURL = 'data:image/svg+xml;base64,' + btoa(svg);
	var filename = 'mentalista_'+d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear()+'.svg';

	var dl = document.createElement("a");
	document.body.appendChild(dl); // This line makes it work in Firefox.
	dl.setAttribute("href", dataURL);
	dl.setAttribute("download", filename);
	dl.click();
}

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
	
	//Uncomment to add alpha
	//bezier.strokeColor.gradient.stops[0].color.alpha = 0.0

	bezier.blendMode = blendMode;

	bezier.strokeWidth = strokeWidth*scale_index;
	
	if(circle == true){
		bezier.strokeCap = 'round';
	} else {
		bezier.strokeCap = 'square';
	}

	bezier.dashArray = [dashIndice,1000];

	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}