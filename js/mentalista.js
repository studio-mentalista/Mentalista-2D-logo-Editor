/* ----------------------------------------------------------------------------------------------------
 * Mentalista Logo Editor, 2017
 * Created: 16/09/17 by Bastien DIDIER
 * 
 * Mentalista logo generator
 *
 * Update: 02/11/20 Current V.1.2
 * ----------------------------------------------------------------------------------------------------
 */

class Mentalista{

	constructor({canvas, rawData} = {canvas: 'canvas', rawData: null}){

		this.urlData = JSON.parse(this.getParameterByName('rawData'));
		if(this.urlData){
			this.rawData = this.urlData;
		} else {
			this.rawData = rawData ?? null;	
		}
		
		this.canvas = canvas ?? 'canvas';

		paper.install(window);

		this.shapeString = '.***.,*****,*****,.***.';
		this.shape = this.shapeMaker(this.shapeString);

		this.gap = { col:80, row:80 };
		this.margin = {
			left: this.innerLeft(),
			top: this.innerTop()
		};

		//–––––––––––––––––––––––––––––––––––
		
		this.nbBezierMax = 30;
		
		this.scale = 1;
		this.pointWidth = 15;
		this.strokeWidth = this.pointWidth;
		
		this.dash = 0;
		this.smooth = 0;
		this.animationSpeed = 2;
		this.maxDashLength = 1000;

		this.strokeCap = 'square';
		this.blendMode = 'normal';
		
		this.color = '#000000';
		this.alternateColor = '#ffffff';
		this.background = '#ffffff';

		this.isTension = true;
		this.isRounded = false;
		this.isBackgroundDisplayed = false;
		this.isGridDisplayed = true;
		this.isTypoDisplayed = true;
		this.isAlpha = false;
		this.isGradient = true;
		this.isDebug = false;

		this.font = new FontFace('Mentalista Grotesque', 'url("https://assets.mentalista.fr/font/mentalista-grotesque/regular/mentalista-grotesque-regular.woff2")', { style: 'normal', weight: 'normal' });
		this.fontSize = 85;

		this.coordinates = this.randomData();

		//–––––––––––––––––––––––––––––––––––
		let self = this;
		window.onload = () => {
			self.init();
		}
		window.onresize = () => {
			self.resize();
		}
	}

	init(){

		this.el = document.getElementById(this.canvas);
		this.el.style.position = 'fixed';
		this.el.style.left = 0;
		this.el.style.top = 0;
		this.el.style.margin = 0;
		this.el.style.padding = 0;
		this.el.style.width = '100%'
		this.el.style.height = '100%';

		paper.setup(this.el);
		//this.update();

		let self = this;
		this.font.load().then(font => {
			document.fonts.add(font);
			
			if(self.rawData){
				self.setData(self.rawData);
			}
			self.update();

			//let exportMode = this.getParameterByName('export');
			//if(exportMode == 'svg'){		
			//	const svg = self.svg();
			//	//document.body.innerText += svg.outerHTML;
			//} else if(exportMode == 'json'){
			//	console.log(self.json());
			//} else {
			//	self.update();
			//}

			paper.view.onFrame = (e) => {
				if(self.dash <= self.maxDashLength){
					self.dash = self.dash + self.animationSpeed;
					//self.smooth++;
					self.update();
				}
			};
		});
	}

	update(params = null){

		if(params){
			for(let key in params){
				if(this[key]){
					this[key] = params[key];
				}
			}	
		}

		paper.project.activeLayer.removeChildren();
		
		if(this.isBackgroundDisplayed){
			this.backgroundColor();
		}

		//Draw bezier
		this.coordinates.forEach(_bezier => {
			this.bezier(_bezier);
		});
		//Draw grid
		if (this.isGridDisplayed){
			this.grid();
		}
		//Draw logotype
		if (this.isTypoDisplayed){
			this.typo(this.fontSize, this.color);
		}

		paper.project.activeLayer.scale(this.scale);
		paper.view.draw();
	}

	resize(){
		this.margin.left = this.innerLeft();
		this.margin.top = this.innerTop();
		this.update();
	}

	innerLeft(){
		return (window.innerWidth - this.gap.col * this.width() )/2
	}

	innerTop(){
		//todo…
		//const typoMargin = this.isTypoDisplayed ? (this.fontSize/2) : 0;
		//const typoMargin = this.fontSize/2;

		return (window.innerHeight - this.gap.row * this.height() )/2 - 50;
	}

	width(){
		return Math.max(...this.shape.map( a => Math.max(...a.map(b=>b.split(',')[1])) ));
	}

	height(){
		return (this.shape.length-1)
	}

	setData(data){
		for (let param in data.config){
			if(typeof this[param] !== undefined){
				if(param == 'shape'){
					this.shapeString = data.config[param];
					this.shape = this.shapeMaker(this.shapeString);
				} else {
					this[param] = data.config[param];
				}
			}
		}
		this.coordinates = data.bezier;
		this.update();
	}
	
	randomData(){
		const ndBezier = Math.floor(Math.random() * this.nbBezierMax) + 1
		let coordinates = new Array();
		for(var i=0; i<ndBezier; i++){
			coordinates.push({
				p1: this.randomCoordinate(),
				p2: this.randomCoordinate(),
				orientation: Math.random() >= 0.5 ? 0 : 1
			});
		}
		return coordinates;
	}

	randomCoordinate(){
		const x = Math.floor(Math.random() * (this.height() - 0 + 1)) + 0;
		const y = Math.floor(Math.random() * ((this.shape[x].length-1) - 0 + 1)) + 0;
		return this.shape[x][y];
	}

	backgroundColor(){
		let background = new paper.Path.Rectangle({
			point: [0,0],
			size: [paper.view.size.width, paper.view.size.height],
			fillColor: this.background
		});
	}

	grid(){
		this.shape.forEach(row => {
			row.forEach(cell =>{
				const [x,y] = cell.split(',');
				let element = new paper.Path.Rectangle({
					center: new paper.Point(this.margin.left + this.gap.col * y, this.margin.top + this.gap.row * x ),
					size: [this.pointWidth, this.pointWidth],
					fillColor: this.color
				});	
				if(this.isRounded){
					element.smooth({ type: 'continuous' });
				}
			});
		});
	}

	typo(){	
		const typoMarginTop = 114;

		let text = new paper.PointText({
			point: [ this.margin.left + this.gap.col * (this.width()/2), this.margin.top + this.gap.row * this.height() + typoMarginTop ],
			content: 'mentalista',
			fillColor: this.color,
			fontFamily: 'Mentalista Grotesque',
			fontWeight: 'normal',
			justification : 'center',
			fontSize: this.fontSize
		});
	}

	bezier({p1, p2, orientation}){

		let [x1, y1] = p1.split(",");
		let [x2, y2] = p2.split(",");
	
		let handleIn, handleOut;
		
		let bezier = {
			x: y1-y2,
			y: x1-x2
		};
	
		let tension = {
			x: this.isTension ? Math.abs(bezier.x) : 1,
			y: this.isTension ? Math.abs(bezier.y) : 1
		}
		
		let handle = {
			p1: [ 0,  this.gap.row * tension.y - (this.smooth/100) * this.gap.row ],
			p2: [ 0, -this.gap.row * tension.y + (this.smooth/100) * this.gap.row ],
			p4: [ -this.gap.col * tension.x + (this.smooth/100) * this.gap.col, 0 ],
			p3: [  this.gap.col * tension.x - (this.smooth/100) * this.gap.col, 0 ]
		};
	
		if (bezier.x > 0){
			
			// Direction du bezier : <----
			if (bezier.y > 0){
	
				// Direction du bezier : monte
				handleIn = new paper.Point(orientation == 0 ? handle.p1 : handle.p3);
				handleOut = new paper.Point(orientation == 0 ? handle.p4 : handle.p2);
	
			} else if (bezier.y < 0){
				
				// Direction du bezier : descend
				handleIn = new paper.Point(orientation == 0 ? handle.p3 : handle.p2);
				handleOut = new paper.Point(orientation == 0 ? handle.p1 : handle.p4);
	
			} else if (bezier.y == 0){
				
				// Direction du bezier : static
				handleIn = null;
				handleOut = null;
			}
			
		} else if (bezier.x < 0){
			
			// Direction du bezier : ---->
			if (bezier.y > 0){
	
				// Direction du bezier : monte
				handleIn = new paper.Point(orientation == 0 ? handle.p1 : handle.p4);
				handleOut = new paper.Point(orientation == 0 ? handle.p3 : handle.p2);
	
			} else if (bezier.y < 0){
				
				// Direction du bezier : descend
				handleIn = new paper.Point(orientation == 0 ? handle.p4 : handle.p2);
				handleOut = new paper.Point(orientation == 0 ? handle.p1 : handle.p3);
	
			} else if (bezier.y == 0){
	
				// Direction du bezier : static
				handleIn = null;
				handleOut = null;
			}
	
		} else if (bezier.x == 0) {
			
			// Direction du bezier : static
			handleIn = null;
			handleOut = null;
			
		}
		
		var finalP1 = new paper.Point(
			this.margin.left+this.gap.col*parseInt(y1),
			this.margin.top+this.gap.row*parseInt(x1)
		);
		var p1_segment = new paper.Segment(finalP1, null, handleOut);
	
		var finalP2 = new paper.Point(
			this.margin.left+this.gap.col*parseInt(y2),
			this.margin.top+this.gap.row*parseInt(x2)
		);
		var p2_segment = new paper.Segment(finalP2, handleIn, null);
	
		bezier = new paper.Path(p1_segment, p2_segment);
		
		//this.alternateColor = this.randomColor();
		
		if(this.isGradient){
			bezier.strokeColor = {
				gradient: {
					stops: [this.alternateColor, this.color]
				},
				origin: finalP1,
				destination: finalP2
			};	
		} else {
			bezier.strokeColor = this.alternateColor;
		}
		
		
		if(this.isAlpha){
			bezier.strokeColor.gradient.stops[0].color.alpha = 0.0;	
		}
	
		bezier.blendMode = this.blendMode;
	
		bezier.strokeWidth = this.strokeWidth*this.scale;
		bezier.strokeCap = this.isRounded ? 'round' : 'square';
		
		if(this.dash < this.maxDashLength){
			bezier.dashArray = [this.dash, this.maxDashLength];	
		}

		if(this.isDebug){
			bezier.fullySelected = true;
		}
	}

	randomColor(){
		return '#'+(0x1000000+(Math.random())*0xffffff).toString(16).substr(1,6);
	}

	randomize(){
		this.pointWidth = Math.floor(Math.random() * 30) + 1;		
		this.isRounded = Math.random() >= 0.5;
		this.alternateColor = this.randomColor();
		this.color = this.randomColor();
		this.strokeWidth = Math.floor(Math.random() * 30) + 1;
		this.coordinates = this.randomData();
		this.resetAnimation();
	}

	svg(){
		
		//todo add defs tag if not present
		let style = document.createElement("style");
			style.setAttribute('type', 'text/css');
			style.innerHTML = '@import url("https://assets.mentalista.fr/font/?family=mentalista-grotesque");';

		let svg = paper.project.exportSVG();
		svg.children[0].appendChild(style); //defs

		//return paper.project.exportSVG({ asString: true });
		return svg;
	}

	json(){
		let data = {
			config: {
				shape: this.shapeString,
				gap: this.gap,
				pointWidth: this.pointWidth,
				strokeWidth: this.strokeWidth,
				blendMode: this.blendMode,
				color: this.color,
				alternateColor: this.alternateColor,
				isRounded: this.isRounded,
				isGridDisplayed: this.isGridDisplayed,
				isTypoDisplayed: this.isTypoDisplayed,
				isAlpha: this.isAlpha,
				isGradient: this.isGradient
			},
			bezier: this.coordinates
		};
		return data;
	}

	uri(){
		return encodeURIComponent(JSON.stringify(this.json()));
	}

	export(type = 'svg'){
		
		//deactivate dashs
		this.dash = null;
		this.update();

		let dataURL;
		let extension;

		if(type == 'svg'){

			const svg = this.svg();
			dataURL = 'data:image/svg+xml;base64,' + btoa(svg.outerHTML);
			extension = 'svg';

		} else if(type == 'json'){

			const json = this.json();
			dataURL = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(json));
			extension = 'json';

		} else if(type == 'png'){
			
			dataURL = this.el.toDataURL("image/png");
			extension = 'png';

		} else {

			return false;
		
		}

		const d = new Date();
		const filename = 'mentalista_'+d.getDate()+'-'+(d.getMonth()+1)+'-'+d.getFullYear()+'.'+extension;

		const dl = document.createElement("a");
		document.body.appendChild(dl); // This line makes it work in Firefox.
		dl.setAttribute("href", dataURL);
		dl.setAttribute("download", filename);
		dl.click();
	}

	resetAnimation(){
		this.dash = 0;
		this.update();
	}

	getParameterByName(name, url) {
    	if (!url) url = window.location.href;
    	name = name.replace(/[\[\]]/g, "\\$&");
    	var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    	    results = regex.exec(url);
    	if (!results) return null;
    	if (!results[2]) return '';
    	return decodeURIComponent(results[2].replace(/\+/g, " "));
	}

	shapeMaker(string){
		let shape = [];
		if(/^[,*.]+$/i.test(string)){
			string.split(',').forEach((line, row) => {
				shape[row] = [];
				[...line].forEach((cell, col) => {
					if(cell == '*'){
						shape[row].push(row+','+col);
					}
				});
			});
			return shape;
		}
	}
}