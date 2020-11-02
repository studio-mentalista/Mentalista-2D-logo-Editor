/********* API PARAMS ************** 
export          : string   : &export= svg | json | uri
************************************/

let mentalista = new Mentalista();

//–––––––– DATA.GUI ––––––––

let gui = new dat.GUI();

let global = gui.addFolder('global');

global.add(mentalista, 'scale', 0.1, 4).step( 0.1 ).onChange(val => {
	mentalista.update({scale: val});
}).listen();

global.addColor(mentalista, 'background').onChange(val => {
	mentalista.background = val;
	mentalista.el.style.backgroundColor = val;
}).listen();

global.addColor(mentalista, 'color').onChange(val => {
	mentalista.update({color: val});
}).listen();

global.addColor(mentalista, 'alternateColor').onChange(val => {
	mentalista.update({alternateColor: val});
}).listen();

global.open();

let grid = gui.addFolder('grid');

grid.add(mentalista, 'shapeString').onFinishChange(val => {
	mentalista.shape = mentalista.shapeMaker(val);
	mentalista.coordinates = mentalista.randomData();
	mentalista.resize();
	mentalista.update();
}).listen();

grid.add(mentalista.gap, 'col', 10, 300 ).step( 1 ).onChange(val => {
	mentalista.gap.col = val;
	mentalista.margin.left = mentalista.innerLeft();
	mentalista.update();
}).listen();

grid.add(mentalista.gap, 'row', 10, 300 ).step( 1 ).onChange(val => {
	mentalista.gap.row = val;
	mentalista.margin.top = mentalista.innerTop();
	mentalista.update();
}).listen();

grid.add(mentalista, 'pointWidth', 1, 30 ).step( 1 ).onChange(val => {
	mentalista.update({pointWidth : val});
}).listen();

grid.add(mentalista, 'isRounded').onChange(val => {
	mentalista.update({isRounded: val});
}).listen();

grid.add(mentalista, 'isGridDisplayed').onChange(val => {
	mentalista.update({isGridDisplayed: val});
}).listen();

grid.add(mentalista, 'isTypoDisplayed').onChange(val => {
	mentalista.update({isTypoDisplayed: val});
	mentalista.margin.top = mentalista.innerTop();
	mentalista.margin.left = mentalista.innerLeft();
}).listen();

grid.open();

let bezier = gui.addFolder('bezier');

bezier.add(mentalista, 'blendMode', ['normal', 'multiply', 'screen', 'overlay', 'soft-light', 'hard- light', 'color-dodge', 'color-burn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'luminosity', 'color', 'add', 'subtract', 'average', 'pin-light', 'negation', 'source- over', 'source-in', 'source-out', 'source-atop', 'destination-over', 'destination-in', 'destination-out', 'destination-atop', 'lighter', 'darker', 'copy', 'xor'] ).onChange(val => {
	mentalista.update({blendMode: val});
}).listen();

bezier.add(mentalista, 'smooth', 0, 100 ).step( 1 ).onChange(val => {
	mentalista.update({smooth: val});
}).listen();

bezier.add(mentalista, 'isTension').onChange(val => {
	mentalista.update({isTension: val});
}).listen();

bezier.add(mentalista, 'isAlpha').onChange(val => {
	if(val == true && mentalista.isGradient == false){
		mentalista.isGradient = true;
	}
	mentalista.update({isAlpha: val});
}).listen();

bezier.add(mentalista, 'isGradient').onChange(val => {
	if(val == false && mentalista.isAlpha == true){
		mentalista.isAlpha = false;
	}
	mentalista.update({isGradient: val});
}).listen();

bezier.add(mentalista, 'strokeWidth', 1, 30 ).step( 1 ).onChange(val => {
	mentalista.update({strokeWidth: val});
}).listen();

bezier.add(mentalista, 'isDebug').onChange(val => {
	mentalista.update({isDebug: val});
}).listen();

bezier.open();

let animation = gui.addFolder('animation');

animation.add(mentalista, 'resetAnimation');

let video = {
	isRecording: false,
	webm: () => {
		if (video.isRecording == false){
			mentalista.isBackgroundDisplayed = true;
			mentalista.resetAnimation();
			video.isRecording = true;
			console.log("start Recording…");
			startRecording();
			requestAnimationFrame(video.frame);
		}
	},
	frame: (timestamp) => {
		if(mentalista.dash <= mentalista.maxDashLength){
			requestAnimationFrame(video.frame);
		} else {
			stopRecording();
			MediaDownload();
			video.isRecording = false;
			mentalista.isBackgroundDisplayed = false;
			console.log("stop Recording…");
		}
	}
}

animation.add(video, 'webm');

animation.open();

let data = gui.addFolder('data');

let params = {json: 'mentalista_2-11-2020'}
data.add( params, 'json').onFinishChange(val => {
	loadData(val).then(json => {
		mentalista.setData(json);
		mentalista.resize();
		mentalista.resetAnimation();
	});
}).listen();

async function loadData(fileName){
	const options = {method: 'GET',cache: 'no-cache'}; //cache ?
	let response = await fetch(new Request('./data/'+fileName+'.json', options));
	let data = await response.json();
	return data;
}

data.add(mentalista, 'randomData').onChange(val => {
	mentalista.coordinates = mentalista.randomData();
	mentalista.resetAnimation();
}).listen();

data.open();

gui.add(mentalista, 'randomize');
gui.add(mentalista, 'export');