/*
 * TODO
 * Synchroniser les Couleurs;
 * Ajouter la fonction Load();
 * OnFrame Event -> Animate bezier
 * Enregistrer le logo .svg dans une variable
 * Choisir entre différents algorithmes de génération de bézier !?
 * Terminaisons des béziers
 * Posibilité d'ajouter différentes formes de logo
 */

var logo_shape = [
        ["0,1","0,2","0,3"],
  ["1,0","1,1","1,2","1,3","1,4"],
  ["2,0","2,1","2,2","2,3","2,4"],
  ["3,0","3,1","3,2","3,3","3,4"],
        ["4,1","4,2","4,3"]
];

var width_gap = 100,
	height_gap = 60,
	rect_size = 10,
	w_margin = (window.innerWidth-width_gap*4)/2, // TODO changer le 4 et le mettre dans une variable
	h_margin = (window.innerHeight-height_gap*4)/2-50,
	circle = false,
	grid_color = '#ae00ff',
	display_grid = true;

var bezier,
	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1,
	nb_bezier_max = 100,
	smooth = 0,
	smooth_height = (smooth/100)*height_gap,
	smooth_width = (smooth/100)*width_gap,
	strokeWidth = 11,
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
	w_margin = (window.innerWidth-width_gap*4)/2;
	Update();
}).listen();

grid.add( params, 'height_gap', 10, 300 ).step( 1 ).onChange( function( value ) {
	height_gap = value;
	h_margin = (window.innerHeight-height_gap*4)/2-50;
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
grid.open();

var bezier = gui.addFolder('Bezier');
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
	params.type = circle == true ? "circle" : "square"
	
	grid_color = '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	params.grid_color = grid_color;
	//console.log(params.grid_color);
	//la valeur est bien enregistrée mais ne mais pas à jour 'color' peut-être parse que .listen() n'existe pas pour addColor();
	
	smooth = Math.floor(Math.random() * (30 - -10 + 1)) + -10;
	params.smooth = smooth;
	
	strokeWidth = Math.floor(Math.random() * (31 - 1 + 1)) + 1;
	params.strokeWidth = strokeWidth;
	
	w_margin = (window.innerWidth-width_gap*4)/2;
	h_margin = (window.innerHeight-height_gap*4)/2-50;

	nb_bezier = Math.floor(Math.random() * (30 - 1 + 1)) + 1;
	params.nb_bezier = nb_bezier;
	
	new_array_coord();	
	Update()	
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
	w_margin = (window.innerWidth-width_gap*4)/2;
	h_margin = (window.innerHeight-height_gap*4)/2-50;
	Update();
};

function Init(){
	new_array_coord()
	Update();
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
};

function onFrame(event) {
	//console.log(event.count);
	//console.log(event.time);
	//console.log(event.delta);
	
	//TODO animate bezier
	//bezier.strokeColor.hue += 1;
	// ?! Update();
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
}

function draw_typo(){
	//Load mentalista.svg
	var typo = paper.project.importSVG("svg/mentalista.svg", function(item) {
		item.position = new Point(w_margin+width_gap*2, h_margin+height_gap*4+80);
	});
	
	//TODO load svg with symbole/item
	//var symbol = new Symbol(typo);
	//symbol.place(new Point(w_margin+width_gap*2, h_margin+height_gap*4+80));
}

function load(){

	//TODO load curve from .json
	alert('[TODO]');

	var url = "json/";
	var file_name = "bezier";
	var nbFiles = 1;
	
	for(var i=1; i<=nbFiles; i++){
		$.ajax({url: url+file_name+i+".json",dataType:"json"})
			.fail(function(){alert(":fail loading "+file_name+""+i+".json file");})
			.done(function(data){
			
			var loadedData = (data);
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
			
			console.log(loadedData.bezier[0].length);

			for(var a=0; a<loadedData.bezier.length; a++){
				
				save_rand_coord.push(new Array());
				
				save_rand_coord[a][0] = loadedData.bezier[a].p1
				save_rand_coord[a][1] = loadedData.bezier[a].p2
				save_rand_coord[a][2] = loadedData.bezier[a].orientation
								
				console.log(loadedData.bezier[a].p1);
			}
			
			Update();
			
			//newDataset.label.push(myData.ID[0].name + " Channel: " + myData.ID[0].Channel);
			/*newDataset.label.push("Channel " + loadedData.ID[0].Channel);
			
			for(var j=0; j<loadedData.Pattern.length; j++){
				newDataset.data.push(loadedData.Pattern[j].FFT_uV);
				config.data.labels.push(loadedData.Pattern[j].FFT_Hz);
			}*/
		});
	};
}

function export_logo(){
	var svg = project.exportSVG({ asString: true });	
	downloadDataURI({
		data: 'data:image/svg+xml;base64,' + btoa(svg),
		filename: 'export.svg'
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
	bezier.strokeColor = 'black';
	bezier.strokeWidth = strokeWidth;
	
	if(bezier_debug == true){
		bezier.fullySelected = true;
	}
}

//Première fonction draw_bezier();
/*function draw_bezier(p1,p2){
	
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

	handle2 = new Point(-width_gap+smooth,0);

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
}*/