//GLOBAL VAR
var logo_form = [
		  ["0,1","0,2","0,3"],
	["1,0","1,1","1,2","1,3","1,4"],
	["2,0","2,1","2,2","2,3","2,4"],
	["3,0","3,1","3,2","3,3","3,4"],
		  ["4,1","4,2","4,3"]
];

var width_gap = 100,
	height_gap = 60,
	rect_size = 10,
	w_margin = (window.innerWidth-width_gap*4)/2,
	h_margin = (window.innerHeight-height_gap*4)/2-50,
	circle = false,
	grid_color = '#000000'; //dat.GUI color scheme selection 
							//https://bl.ocks.org/mootari/bfbf01320da6c14f9cba186c581d507d

var bezier,
	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1,
	nb_bezier_max = 100,
	smooth = 0,
	strokeWidth = 3,
	bezier_debug = false;
	
var save_rand_coord = new Array();

/**********************************************/

//DAT.GUI
var params = {
	width_gap : width_gap,
	height_gap: height_gap,
	rect_size:  rect_size,
	type: 'square',
	color: grid_color,
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
	w_margin = (window.innerWidth-width_gap*4)/2;
	Update();
});
grid.add( params, 'height_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	height_gap = value;
	h_margin = (window.innerHeight-height_gap*4)/2-50;
	Update();
});
grid.add( params, 'rect_size', 1, 30 ).step( 1 ).onChange( function( value ) {
	rect_size = value;
	Update();
});
grid.add(params, 'type', [ 'square', 'circle'] ).onChange( function(value){
	if (params.type === 'circle'){
		circle = true;
	} else {
		circle = false;
	}
	Update();
});
grid.addColor( params, 'color').onChange( function( value ) {
	grid_color = value;
	Update();
});
//grid.open();


var bezier = gui.addFolder('Bezier');
bezier.add( params, 'nb_bezier', 1, 100 ).step( 1 ).onChange( function( value ) {
	nb_bezier = value;
	Update();
});
bezier.add( params, 'smooth', -10, 20 ).step( 1 ).onChange( function( value ) {
	smooth = value;
	Update();
});
bezier.add( params, 'strokeWidth', 1, 31 ).step( 1 ).onChange( function( value ) {
	strokeWidth = value;
	Update();
});
bezier.add( params, 'debug').onChange( function( value ) {
	bezier_debug = value;
	Update();
});
bezier.open();

gui.add( params, 'load');
gui.add( params, 'random');
gui.add( params, 'export');

function randomize(){
	width_gap = Math.floor(Math.random() * (200 - 10 + 1)) + 10;
	height_gap = Math.floor(Math.random() * (200 - 100 + 1)) + 10;
	rect_size = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	
	circle = Math.random() >= 0.5;
	
	grid_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);

	smooth = Math.floor(Math.random() * (30 - -10 + 1)) + -10;
	strokeWidth = Math.floor(Math.random() * (31 - 1 + 1)) + 1;

	w_margin = (window.innerWidth-width_gap*4)/2;
	h_margin = (window.innerHeight-height_gap*4)/2-50;

	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	
	new_array_coord();	
	Update()
	
  	// Iterate over all controllers
    //updateDisplay(gui);
}

//TODO
/*function updateDisplay(gui) {
    for (var i in gui.__controllers) {
        gui.__controllers[i].updateDisplay();
    }
    for (var f in gui.__folders) {
        updateDisplay(gui.__folders[f]);
    }
}*/

function randCoord(){
	var x = Math.floor(Math.random() * ((logo_form.length-1) - 0 + 1)) + 0;
	var y = Math.floor(Math.random() * ((logo_form[x].length-1) - 0 + 1)) + 0;
	return logo_form[x][y];
}

function new_array_coord(){
	for(var i=0; i<nb_bezier_max; i++){
		save_rand_coord.push(new Array());
		for(var j=0; j<2; j++){
			save_rand_coord[i][j] = randCoord();
		}
	}
}

/**********************************************/

//INIT
window.load = Init();

//RESIZE CLIENT
window.onresize = function() {
	w_margin = (window.innerWidth-width_gap*4)/2;
	h_margin = (window.innerHeight-height_gap*4)/2-50;
	Update();
};

function Init(){
	
	new_array_coord()

	draw_curve();
	draw_rect();
};

function Update(){
	project.activeLayer.removeChildren();
	draw_curve();
	draw_rect();
	
};

function onFrame(event) {
	// the number of times the frame event was fired:
	/*console.log(event.count);

	// The total amount of time passed since
	// the first frame event in seconds:
	console.log(event.time);

	// The time passed in seconds since the last frame event:
	console.log(event.delta);
	
	//TODO animate bezier
	bezier.strokeColor.hue += 1;*/
}

//TODO EXPORT TO SVG
/*var t;
t = new Tool();

//Listen for "s" to save content as SVG file.
t.onKeyUp = function(event) {
	if(event.character == "s") {
		downloadAsSVG("test.svg");
	}
}

var downloadAsSVG = function (fileName) {
	
	if(!fileName) {
		fileName = "paperjs_example.svg"
	}

	var url = "data:image/svg+xml;utf8," + encodeURIComponent(paper.project.exportSVG({asString:true}));

	var link = document.createElement("a");
		link.download = fileName;
		link.href = url;
		link.click();
}*/

/**********************************************/

function draw_rect(){
	var path = new Path.Rectangle({
		point: [-100, -100], //TODO remove coord
		size: [rect_size, rect_size],
		fillColor: grid_color,
		strokeColor: grid_color
	});

	//TODO Display or not the grid
	for(var i = 0; i < logo_form.length; i++) {
		for(var j = 0; j < logo_form[i].length; j++) {
			
			var coord = logo_form[i][j];
			var coord = coord.split(",");

			var gridPath = path.clone();
			if(circle == true){
				gridPath.smooth({ type: 'continuous' });
			}

			gridPath.position = new Point(w_margin+width_gap*coord[1], h_margin+height_gap*coord[0]);
		}
	}
	
	//à retirer et mettre seul dans une fonction
	//Load mentalista.svg
	paper.project.importSVG("svg/mentalista.svg", function(item) {
		item.position = new Point(w_margin+width_gap*2, h_margin+height_gap*4+80);
	})
	
	//TODO load svg with symbole
	//typo.place(new Point(w_margin+width_gap*2, h_margin+height_gap*4+80));
}

function load(){alert('[TODO]');}

function export_logo(){alert('[TODO]');}

function draw_curve(){

	//TODO load curve from .json
    /*
	$.getJSON('json/bezier.json', function (data) {
    	data = JSON.parse(data);
    	project.importJSON(data);
	});
    */

	var jsonData = {
		"bezier": [
		    {"p1":"0,1", "p2":"2,2", "p3": null, "smooth": 0},
		    {"p1":"0,1", "p2":"0,1", "p3": null, "smooth": 0},
		    {"p1":"0,1", "p2":"0,1", "p3": null, "smooth": 0}
		]  
	}
	project.importJSON(JSON.stringify(jsonData));

	//var p1 = "1,1"; //jsonData.bezier.[0].p1
	//var p2 = "2,2"; //jsonData.bezier.[0].p2
	
	/*draw_bezier("1,1","2,2");
	draw_bezier("2,1","3,0");
	draw_bezier("4,2","3,3");
	draw_bezier("0,2","0,3");
	draw_bezier("1,3","3,4");
	draw_bezier("4,3","3,3");
	draw_bezier("2,2","1,3");*/

	//TODO exporter dans un json pour la modification
	for(var i=0; i<nb_bezier; i++){
		//draw_bezier(randCoord(),randCoord());
		draw_bezier(save_rand_coord[i][0],save_rand_coord[i][1]);
	}

	// ^- TODO -^
	//-----------------------------------------------------------

	var handleIn = new Point(-width_gap+smooth, 0);
	var handleOut = new Point(0, height_gap-smooth);

	var firstPoint = new Point(w_margin+width_gap*2, h_margin+height_gap);
	var firstSegment = new Segment(firstPoint, null, handleOut);

	var secondPoint = new Point(w_margin+width_gap*3, h_margin+height_gap*2);
	var secondSegment = new Segment(secondPoint, handleIn, null);

	var path = new Path(firstSegment, secondSegment);
	path.strokeColor = 'black';
	path.strokeWidth = strokeWidth;
	//path.fullySelected = true;
}

function draw_bezier(p1,p2){
	
	var coord1 = p1.split(",");
	var coord2 = p2.split(",");

	var handle1,handle2;

	if(coord1[0]-coord2[0] > 0){
		if(coord1[1]-coord2[1] > 0){
			handle1 = new Point(0,-height_gap-smooth);
		} else {
			handle1 = new Point(0,height_gap-smooth);
		}
	} else {
		if(coord1[1]-coord2[1] > 0){
			handle1 = new Point(0,-height_gap-smooth);
		} else {
			handle1 = new Point(0,height_gap-smooth);
		}
	}

	//TODO sens du bezier !? 
	handle2 = new Point(-width_gap+smooth,0);
	//var handle1 = new Point(0,height_gap-smooth);

	var p1_point = new Point(
		w_margin+width_gap*parseInt(coord1[0]),
		h_margin+height_gap*parseInt(coord1[1])
	);
	var p1_segment = new Segment(p1_point, null, handle1);

	var p2_point = new Point(
		w_margin+width_gap*parseInt(coord2[0]),
		h_margin+height_gap*parseInt(coord2[1])
	);
	var p2_segment = new Segment(p2_point, null, handle2);
	
	bezier = new Path(p1_segment, p2_segment);
	bezier.strokeColor = 'black';
	bezier.strokeWidth = strokeWidth;
	
	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}