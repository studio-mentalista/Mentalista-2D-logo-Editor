/*
 * TODO
 *
 * Add options for strokeColor
 * Synchroniser les Couleurs;
 * add event for typo loading
 *
 * OnFrame Event -> Animate bezier
 *
 * => Option pour exporter en URI pour les devis/factures/lettres/contrats
 * => Mur de pensée
 *
 */

var logo_shape;

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

logo_shape = new_logo_shape; //choisir la forme de base

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

var width_gap = 80,
	height_gap = 80,
	rect_size = 14,
	w_margin = (window.innerWidth-width_gap*logo_w())/2,
	h_margin = (window.innerHeight-height_gap*logo_h())/2-50,
	circle = false,
	grid_color = '#000000'//'#ae00ff',
	display_grid = true;

var bezier,
	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1,
	nb_bezier_max = 100,
	smooth = 0,
	smooth_height = (smooth/100)*height_gap,
	smooth_width = (smooth/100)*width_gap,
	strokeWidth = 15,
	bezier_debug = false,
	strokeCap = 'square',
	blendMode = 'normal';
	
var save_rand_coord = new Array();

/**********************************************/

//DAT.GUI
var params = {
	form: 'new',
	width_gap : width_gap,
	height_gap: height_gap,
	rect_size:  rect_size,
	shape: 'square',
	color: grid_color,
	display_grid: display_grid,
	//type: 'algo_1',
	nb_bezier: nb_bezier,
	smooth: smooth,
	strokeWidth : strokeWidth,
	debug : bezier_debug,
	blendMode : blendMode,
	load: function(){load();},
	random: function(){randomize();},
	export: function(){export_logo();}
};

var gui = new dat.GUI();

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
grid.add( params, 'rect_size', 1, 30 ).step( 1 ).onChange( function( value ) {
	rect_size = value;
	Update();
}).listen();
grid.add(params, 'shape', [ 'square', 'circle'] ).onChange( function(value){
	/*if (params.shape === 'circle'){
		circle = true;
	} else {
		circle = false;
	}*/
	circle = params.shape === 'circle' ? true : false;
	Update();
}).listen();
grid.addColor( params, 'color').onChange( function( value ) {
	grid_color = value;
	Update();
}).listen();

grid.add( params, 'display_grid').onChange( function( value ) {
	display_grid = value;
	Update();
}).listen();
grid.close(); //open();

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
bezier.add( params, 'strokeWidth', 1, 31 ).step( 1 ).onChange( function( value ) {
	strokeWidth = value;
	Update();
}).listen();
bezier.add( params, 'debug').onChange( function( value ) {
	bezier_debug = value;
	Update();
}).listen();
bezier.open();

gui.add( params, 'load');
gui.add( params, 'random');
gui.add( params, 'export');

/**********************************************/

function randomize(){
	width_gap = Math.floor(Math.random() * (200 - 10 + 1)) + 10;	
	params.width_gap = width_gap;
	
	height_gap = Math.floor(Math.random() * (200 - 100 + 1)) + 10;
	params.height_gap = height_gap;
	
	rect_size = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.rect_size = rect_size;
	
	circle = Math.random() >= 0.5;
	params.shape = circle == true ? "circle" : "square";
	
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
	
	new_array_coord();	
	Update();
}

function randCoord(){
	var x = Math.floor(Math.random() * ((logo_shape.length-1) - 0 + 1)) + 0;
	var y = Math.floor(Math.random() * ((logo_shape[x].length-1) - 0 + 1)) + 0;
	return logo_shape[x][y];
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
	new_array_coord();
	Update();
	//draw_typo();
	//svg_to_uri();
};

function Update(){
	project.activeLayer.removeChildren();
	
	for(var i=0; i<nb_bezier; i++){
		//Ajouter la possibilité d'autres formes
		draw_bezier(save_rand_coord[i][0],save_rand_coord[i][1],save_rand_coord[i][2]);
	}

	if (display_grid == true){
		draw_grid();
	}
	draw_typo();
};

function onFrame(event) {
	//console.log(event.count);
	//console.log(event.time);
	//console.log(event.delta);
	
	//TODO animate bezier
	
	//Update();
	
	/*project.activeLayer.removeChildren();
	
	for(var i=0; i<nb_bezier; i++){
		bezier.opacity += 0.01;
		
		draw_bezier(save_rand_coord[i][0],save_rand_coord[i][1],save_rand_coord[i][2]);
	}
	
	if (display_grid == true){
		draw_grid();
	}
	draw_typo();*/
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
		size: [rect_size, rect_size],
		fillColor: grid_color,
		strokeColor: grid_color
	});

	for(var i = 0; i < logo_shape.length; i++) {
		for(var j = 0; j < logo_shape[i].length; j++) {
			
			var coord = logo_shape[i][j];
			var coord = coord.split(",");

			var gridPath = path.clone();
			if(circle == true){
				gridPath.smooth({ type: 'continuous' });
			}

			gridPath.position = new Point(w_margin+width_gap*coord[1], h_margin+height_gap*coord[0]);
		}
	}
	path.remove();
	
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
	var text = new PointText({
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
	var file_name = "bezier";
	var nbFiles = 1;
	
	for(var i=1; i<=nbFiles; i++){
		$.ajax({url: url+file_name+".json",dataType:"json"})
			.fail(function(){alert("fail loading : "+file_name+i+".json");})
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
	
	if (coord1[1]-coord2[1] > 0){
		//console.log("direction du bezier : <----");
		
		if (coord1[0]-coord2[0] > 0){
			//console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0, height_gap-smooth_height);
				handleOut = new Point(-width_gap+smooth_width, 0);
			} else {
				handleIn = new Point(width_gap-smooth_width,0);
				handleOut = new Point(0,-height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] < 0){
			//console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap-smooth_height);
				handleIn = new Point(width_gap-smooth_width, 0);
			} else {
				handleOut = new Point(-width_gap+smooth_width,0);
				handleIn = new Point(0,-height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] == 0){
			//console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
		
	} else if (coord1[1]-coord2[1] < 0){
		//console.log("direction du bezier : ---->");
		
		if (coord1[0]-coord2[0] > 0){
			//console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0,height_gap-smooth_height);
				handleOut = new Point(width_gap-smooth_width,0);
			} else {
				handleIn = new Point(-width_gap+smooth_width, 0);
				handleOut = new Point(0, -height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] < 0){
			//console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap-smooth_height);
				handleIn = new Point(-width_gap+smooth_width, 0);
			} else {
				handleOut = new Point(width_gap-smooth_width, 0);
				handleIn = new Point(0, -height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] == 0){
			//console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
	} else if (coord1[1]-coord2[1] == 0) {
		//console.log("direction du bezier : Static");
		
		if (coord1[0]-coord2[0] > 0){
			//console.log("direction du bezier : monte");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (coord1[0]-coord2[0] < 0){
			//console.log("direction du bezier : descend");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (coord1[0]-coord2[0] == 0){
			//console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
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

	bezier.strokeColor = {
		gradient: {
        	stops: ['white', grid_color]
    	},
    	origin: p1_point,
    	destination: p2_point
	};
	
	//bezier.strokeColor.gradient.stops[0].color.alpha = 0.0

	bezier.blendMode = blendMode;

	bezier.strokeWidth = strokeWidth;
	
	if(circle == true){
		bezier.strokeCap = 'round';
	} else {
		bezier.strokeCap = 'square';
	}

	//bezier.dashArray = [1, 100];

	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}