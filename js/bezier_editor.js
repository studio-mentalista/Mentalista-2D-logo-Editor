/*
 * TODO
 * Syncroniser les Couleurs;
 * Ajouter la fonction Load();
 * OnFrame Event -> Animate bezier
 * Améliorer la génération des béziers
 * Enregistrer le logo .svg dans une variable
 * smooth = height_gap && width_gap
 */

var logo_shape = [
  ["0,0","0,1","0,2"],
  ["1,0","1,1","1,2"],
  ["2,0","2,1","2,2"],
];

var width_gap = 100,
	height_gap = 60,
	rect_size = 10,
	w_margin = (window.innerWidth-width_gap*logo_shape.length)/2,
	h_margin = (window.innerHeight-height_gap*logo_shape.length)/2-50,
	circle = false,
	grid_color = '#000000',
	display_grid = true;

var bezier,
	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1,
	nb_bezier_max = 100,
	smooth = 0,
	smooth_height = (smooth/100)*height_gap,
	smooth_width = (smooth/100)*width_gap,
	strokeWidth = 3,
	bezier_debug = true;
	
var save_rand_coord = new Array();

/**********************************************/

//DAT.GUI
var params = {
	width_gap : width_gap,
	height_gap: height_gap,
	rect_size:  rect_size,
	type: 'square',
	color: grid_color,
	display_grid: display_grid,
	nb_bezier: nb_bezier,
	smooth: smooth,
	strokeWidth : strokeWidth,
	debug : bezier_debug,
	load: function(){load();},
	random: function(){randomize();},
	export: function(){export_logo();}
};

var gui = new dat.GUI();

var grid = gui.addFolder('Grid');
grid.add( params, 'width_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	width_gap = value;
	w_margin = (window.innerWidth-width_gap*logo_shape.length)/2;
	Update();
}).listen();

grid.add( params, 'height_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	height_gap = value;
	h_margin = (window.innerHeight-height_gap*logo_shape.length)/2-50;
	Update();
}).listen();
grid.add( params, 'rect_size', 1, 30 ).step( 1 ).onChange( function( value ) {
	rect_size = value;
	Update();
}).listen();
grid.add(params, 'type', [ 'square', 'circle'] ).onChange( function(value){
	if (params.type === 'circle'){
		circle = true;
	} else {
		circle = false;
	}
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
//grid.open();

var bezier = gui.addFolder('Bezier');

/*var bezier_config = bezier.addFolder('Bezier Config');
bezier_config.add( params, 'nb_bezier', 0, 100 ).step( 1 ).onChange( function( value ) {
	nb_bezier = value;
	Update();
}).listen();*/

bezier.add( params, 'nb_bezier', 0, 100 ).step( 1 ).onChange( function( value ) {
	nb_bezier = value;
	Update();
}).listen();
bezier.add( params, 'smooth', 0, 100 ).step( 1 ).onChange( function( value ) {
	smooth = value;
	smooth_height = (value/100)*height_gap;
	smooth_width = (value/100)*width_gap;
	// TODO smooth = height_gap && width_gap
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

//INIT
window.load = Init();

//RESIZE CLIENT
window.onresize = function() {
	w_margin = (window.innerWidth-width_gap*logo_shape.length)/2;
	h_margin = (window.innerHeight-height_gap*logo_shape.length)/2-50;
	Update();
};

function Init(){

	Update();
};

function Update(){
	project.activeLayer.removeChildren();
	
	//draw_bezier("0,0","1,1",1);
	//draw_bezier("0,2","1,1",1);
	
	//draw_bezier("2,2","1,1",1);
	//draw_bezier("2,0","1,1",0);
	
	draw_path("2,0","1,1",0);

	//draw_bezier("0,0","2,2",0);
		
	if (display_grid == true){
		draw_grid();
	}
};

function draw_path(p1,p2,orientation){
	
	var handleIn,handleOut;

	path = new Path();
	path.fillColor = {
		hue: 360,
		saturation: 1,
		brightness: 1,
	};

	/*gradient: {
        stops: [['yellow', 0.05], ['red', 0.2], ['black', 1]],
        radial: true
    },
    origin: path.position,
    destination: path.bounds.rightCenter*/

	var coord1 = p1.split(",");
	var coord2 = p2.split(",");

	var p1_point = new Point(
		w_margin+width_gap*parseInt(coord1[1]),
		h_margin+height_gap*parseInt(coord1[0])
	);

	var p1_point_bis = new Point(
		w_margin+width_gap*parseInt(0),
		h_margin+height_gap*parseInt(1)
	);


	var p2_point = new Point(
		(w_margin+width_gap*parseInt(coord2[1]))-rect_size/2,
		(h_margin+height_gap*parseInt(coord2[0]))-rect_size/2
	);

	var p3_point = new Point(
		(w_margin+width_gap*parseInt(coord2[1]))-rect_size/2,
		(h_margin+height_gap*parseInt(coord2[0]))+rect_size/2
	);


	
	handleOut = new Point(-rect_size/2+smooth_width/20,-height_gap+smooth_height);
	handleOut2 = new Point(rect_size/2-smooth_width/20,-height_gap+smooth_height);
	handleIn = new Point(-width_gap+smooth_width,0);

	var p1_segment = new Segment(p1_point, null, handleOut);

	path.add(p1_segment);

	var p2_segment = new Segment(p2_point, handleIn, null);
	
	path.add(p2_segment);
	
	//path.add(p2_point);

	var p3_segment = new Segment(p3_point, null, handleIn);
	path.add(p3_segment);

	var p4_segment = new Segment(p1_point, handleOut2, null);
	path.add(p4_segment);

	//path.add(p1_point);

	//path.smooth();
	if(bezier_debug == true){
		//path.fullySelected = true;
	}

	path.closed = true;
	//alert("yo");
}
function draw_bezier(p1,p2,orientation){
	
	var coord1 = p1.split(",");
	var coord2 = p2.split(",");
	
	var handleIn,handleOut;
	
	if (coord1[1]-coord2[1] > 0){
		console.log("direction du bezier : <----");
		
		if (coord1[0]-coord2[0] > 0){
			console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0, height_gap-smooth_height);
				handleOut = new Point(-width_gap+smooth_width, 0);
			} else {
				handleIn = new Point(width_gap-smooth_width,0);
				handleOut = new Point(0,-height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] < 0){
			console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap-smooth_height);
				handleIn = new Point(width_gap-smooth_width, 0);
			} else {
				handleOut = new Point(-width_gap+smooth_width,0);
				handleIn = new Point(0,-height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] == 0){
			console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
		
	} else if (coord1[1]-coord2[1] < 0){
		console.log("direction du bezier : ---->");
		
		if (coord1[0]-coord2[0] > 0){
			console.log("direction du bezier : monte");
			if (orientation == 0){
				handleIn = new Point(0,height_gap-smooth_height);
				handleOut = new Point(width_gap-smooth_width,0);
			} else {
				handleIn = new Point(-width_gap+smooth_width, 0);
				handleOut = new Point(0, -height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] < 0){
			console.log("direction du bezier : descend");
			if (orientation == 0){
				handleOut = new Point(0, height_gap-smooth_height);
				handleIn = new Point(-width_gap+smooth_width, 0);
			} else {
				handleOut = new Point(width_gap-smooth_width, 0);
				handleIn = new Point(0, -height_gap+smooth_height);
			}
		} else if (coord1[0]-coord2[0] == 0){
			console.log("direction du bezier : static");
			handleIn = p1_point;
			handleOut = p2_point;
		}
	} else if (coord1[1]-coord2[1] == 0) {
		console.log("direction du bezier : Static");
		
		if (coord1[0]-coord2[0] > 0){
			console.log("direction du bezier : monte");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (coord1[0]-coord2[0] < 0){
			console.log("direction du bezier : descend");
			handleIn = p1_point;
			handleOut = p2_point;
			
		} else if (coord1[0]-coord2[0] == 0){
			console.log("direction du bezier : static");
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
	bezier.strokeColor = 'black';
	bezier.strokeWidth = strokeWidth;
	
	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}

/**********************************************/

/*function new_array_coord(){
		
	//TODO Amélioration : détecter les béziers qui sont sur le même point
	
	for(var i=0; i<nb_bezier_max; i++){
		save_rand_coord.push(new Array());
		for(var j=0; j<2; j++){
			save_rand_coord[i][j] = randCoord();
		}
	}
}*/

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
}