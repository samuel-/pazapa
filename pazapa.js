var cy = cytoscape({

  container: document.getElementById('cy') ,
  elements: [ /* ... */ ],
      // elements: [
      // { data: { label: 'top left' }, classes: 'top-left' },
      // { data: { label: 'top center' }, classes: 'top-center' },
      // { data: { label: 'top right' }, classes: 'top-right' }],

    style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': 'rgb(40,40,200)',
		//'opacity': 0.8,
		'width': '15px',
		'height': '15px'
		//,
        //'label': 'data(id)'
      }
    },


    {
      selector: 'edge',
      style: {
        'width': 1,
        'line-color': 'black',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle',
		'label': 'data(label)'
      }
    },
	
	
	{
		selector: '.up',
		style: {
			'background-color': 'rgb(40,200,200)',
		}
	},
	{
		selector: '.depart',
		style: {
			'background-color': 'rgb(0,255,0)',
		}
	},
	{
		selector: '.arrivee',
		style: {
			'background-color': 'rgb(255,0,0)',
		}
	},

	{
        selector: '.selected',
        style: {
          'background-color': 'yellow',
          'line-color': 'yellow'
          //'target-arrow-color': 'black',
          //'source-arrow-color': 'black',
        }
      }
	
  ],
  
  
  layout: {
      name: 'grid',  cols: 3
    },

  // initial viewport state:
  zoom: 1,
  pan: { x: 0, y: 0 },
  minZoom: 1e-50,
  maxZoom: 1e50,

  // interaction options:
  zoomingEnabled: false,
  userZoomingEnabled: false,
  panningEnabled: false,
  userPanningEnabled: false,
  boxSelectionEnabled: true,
  selectionType: 'single',
  touchTapThreshold: 8,
  desktopTapThreshold: 4,
  autolock: false,
  autoungrabify: false,
  autounselectify: false,

  // rendering options:
  headless: false,
  styleEnabled: true,
  hideEdgesOnViewport: false,
  textureOnViewport: false,
  motionBlur: false,
  motionBlurOpacity: 0.2,
  wheelSensitivity: 1,
  pixelRatio: 'auto'


});

var state = "planning";
var etatArete = null;

var sc = 1.85;
var px = 188;
var py = -38;
var dx = 25;
var dy = -25;

var myEdges = {};
var chemins = [];
var obstacles = {
			'escalier': 0,
			'abri': 0,
			'porte': 0,
			'pente': 0,
			'ascenceur': 0,
			'chien': 0
			};

var obstaclesTags = {
			'escalier': '→',
			'abri': '^^',
			'porte': '[]',
			'pente': '▲',
			'ascenceur': '↕',
			'chien': '>:'
			};

var rdc = cy.add([
  { group: 'nodes', data: { id: 'n0' }, position: { x: 120*sc+px, y: 55*sc+py } },
  { group: 'nodes', data: { id: 'n1' }, position: { x: 170*sc+px, y: 55*sc+py } },
  { group: 'nodes', data: { id: 'n2' }, position: { x: 170*sc+px, y: 81*sc+py } },
  { group: 'nodes', data: { id: 'n3' }, position: { x: 280*sc+px, y: 82*sc+py } },
  { group: 'nodes', data: { id: 'n4' }, position: { x: 380*sc+px, y: 84*sc+py } },
  { group: 'nodes', data: { id: 'n5' }, position: { x: 485*sc+px, y: 85*sc+py } },
  { group: 'edges', data: { id: 'e0', source: 'n0', target: 'n1'} },
  { group: 'edges', data: { id: 'e1', source: 'n1', target: 'n2'} },
  { group: 'edges', data: { id: 'e2', source: 'n2', target: 'n3'} },
  { group: 'edges', data: { id: 'e3', source: 'n3', target: 'n4'} },
  { group: 'edges', data: { id: 'e4', source: 'n4', target: 'n5'} }
]);
var etage1 = cy.add([
  { group: 'nodes', data: { id: 'n10' }, position: { x: 125*sc+px+dx, y: 60*sc+py+dy }, classes:'up' },
  { group: 'nodes', data: { id: 'n11' }, position: { x: 175*sc+px+dx, y: 60*sc+py+dy }, classes:'up' },
  { group: 'nodes', data: { id: 'n12' }, position: { x: 175*sc+px+dx, y: 81*sc+py+dy }, classes:'up' },
  { group: 'nodes', data: { id: 'n13' }, position: { x: 280*sc+px+dx, y: 82*sc+py+dy }, classes:'up' },
  { group: 'nodes', data: { id: 'n14' }, position: { x: 380*sc+px+dx, y: 84*sc+py+dy }, classes:'up' },
  { group: 'nodes', data: { id: 'n15' }, position: { x: 485*sc+px+dx, y: 85*sc+py+dy }, classes:'up' },
  { group: 'edges', data: { id: 'e10', source: 'n10', target: 'n11'} },
  { group: 'edges', data: { id: 'e11', source: 'n11', target: 'n12'} },
  { group: 'edges', data: { id: 'e12', source: 'n12', target: 'n13'} },
  { group: 'edges', data: { id: 'e13', source: 'n13', target: 'n14'} },
  { group: 'edges', data: { id: 'e14', source: 'n14', target: 'n15'} }
]);
var escaliers = cy.add([
  { group: 'edges', data: { id: 'e20', source: 'n0', target: 'n10'} },
  { group: 'edges', data: { id: 'e21', source: 'n1', target: 'n11'} },
  { group: 'edges', data: { id: 'e22', source: 'n3', target: 'n13'} },
  { group: 'edges', data: { id: 'e23', source: 'n4', target: 'n14'} },
  { group: 'edges', data: { id: 'e24', source: 'n5', target: 'n15'} }
]);

function edgeInit(id){
	edge = cy.$id(id);
	var obstaclesArete = {
		'escalier': 0,
		'abri': 0,
		'porte': 0,
		'pente': 0,
		'ascenceur': 0,
		'chien': 0
	};
	edge.data('temps', 0);
	edge.data('obstacles', obstaclesArete);
}

//const somme = (accumulator, currentValue) => accumulator + currentValue;

for (i=0;i<5;i++){
	edgeInit('e'+i);
	edgeInit('e1'+i);
	edgeInit('e2'+i);
}

var depart = "";
var arrivee = "";
var setting = 0;

var thisid = 100;

var curTxt = document.createElement('div');
curTxt.id = "cursorText";
document.body.appendChild(curTxt);
var curTxtLen = [curTxt.offsetWidth,curTxt.offsetHeight];

var selectedPath = null;

cy.on('tap', 'node', function(evt){
	var node = evt.target;
	if(state=="planning" ){
		if (setting == 0){
			if (depart != "") depart.removeClass('depart');
			depart = node;
			depart.addClass('depart');
			depart.removeClass('arrivee');
			setting = 1;
			console.log( 'tapped depart ' + node.id() );
		}
		else {
			if (arrivee != "") arrivee.removeClass('arrivee');
			arrivee = node;
			arrivee.addClass('arrivee');
			arrivee.removeClass('depart');
			setting = 0;
			console.log( 'tapped arrivee ' + node.id() );
			if (arrivee==depart) {
				node.remove();
			}
			else {
				thisid ++;
				cy.add([
				{ group: 'edges', data: { id: thisid, source: depart.id(), target: arrivee.id()} },
				]);
				edgeInit(thisid);
			}
			depart.removeClass('depart');
			arrivee.removeClass('arrivee');
		}
	}
	else if(state=="getpaths"){

		if (setting == 0){
			if (depart != "") depart.removeClass('depart');
			depart = node;
			depart.addClass('depart');
			depart.removeClass('arrivee');
			setting = 1;
			console.log( 'tapped depart ' + node.id() );
		}
		else {
			if (arrivee != "") arrivee.removeClass('arrivee');
			arrivee = node;
			arrivee.addClass('arrivee');
			arrivee.removeClass('depart');
			setting = 0;
			console.log( 'tapped arrivee ' + node.id() );
			//look(depart.id(),arrivee.id());
			//
			chemins = [];
			look(depart.id(),arrivee.id());
			dothepaths();
			selectpath(0);
		}
	}
});

function zip(question,mult=1){
	var thing = prompt(question, "laisser vide si non" );
	return thing == "laisser vide si non" || thing == null || thing == "" ? 0:1*mult;
}

cy.on('tap', 'edge', function(evt){
	var edge = evt.target;
	if(state=="planning"){
		edge.remove();
	}
	
	else if (etatArete != null){

		var tmpO = edge.data('obstacles');
		if (tmpO[etatArete] == 0) tmpO[etatArete] = 1;
		else tmpO[etatArete] = 0;
		
		console.log(tmpO);
		
		edge.data('obstacles', tmpO);
		setLabel(edge);
		console.log( 'tapped ' + edge.id() );
	}
	else if(state=="placeWeights"){
		var txt = parseInt(edge.data('temps'));
		if (isNaN(txt)) txt = '';
		var temps = prompt("temps de trajet ? (en secondes)", txt );
		/*
		var escalier = zip("présence d'escalier ?");
		var abri = zip("trajet abrité ?");
		var portebattante = zip("présence de porte battante ?");
		var penteimportante = zip("présence d'une pente importante ?");
		var ascenceur = zip("présence d'un ascenceur ?");
		var chien = zip("présence d'un chien méchant ?");
		*/
		//if (temps==null || temps=="") temps = 0;
		temps = parseInt(temps) || 0;
		edge.data('temps', temps);
		setLabel(edge);
		console.log( 'tapped ' + edge.id() );
	}
});

cy.on('box', 'edge', function(evt){
	if (etatArete != null){
		var edge = evt.target;
		//console.log(evt.target);
		var tmpO = edge.data('obstacles');
		if (tmpO[etatArete] == 0) tmpO[etatArete] = 1;
		else tmpO[etatArete] = 0;
		edge.data('obstacles', tmpO);
		setLabel(edge);
		console.log( 'tapped ' + edge.id() );
	}
});

function toggle(o){
	if (o == 0) o = 1;
	else o = 0;
}

function setLabel(edge){
	temps = parseInt(edge.data('temps')) || 0;
	var result = temps.toString();
	if (edge.data('obstacles')['escalier']) { result += " →";}
	if (edge.data('obstacles')['abri']) { result += " ^^";}
	if (edge.data('obstacles')['porte']) { result += " []";}
	if (edge.data('obstacles')['pente']) { result += " ▲";}
	if (edge.data('obstacles')['ascenceur']) { result += " ↕";}
	if (edge.data('obstacles')['chien']) { result += " >:";}
	edge.data('label',result);
}

cy.on('tap', function(evt){
	console.log(evt.target===cy);
	if(state=="planning" && evt.target===cy) {
		thisid ++;
		console.log(evt);
		cy.add([
		{ group: 'nodes', data: { id: thisid }, position: evt.position },
		]);
	}
});

function setPoidsObstacle(ob, val){
	obstacles[ob]=parseInt(val)||0;
	if (selectedPath!=null){selectpath(selectedPath);}
}

/*function paths(sid,fid){
	var chemins = [];	
	var res = look(sid,fid);
	return chemins;
}*/

function look(sid, fid, path = []) {
	var node = cy.$id(sid);
    if (path.includes(sid)) return false;
	if (node.isEdge()) return false;
	if (path.length > 16) return false;
    path.push(sid);
  	// trouvé le noeud d'arrivée !
	if (sid == fid) {
        console.log(path);
        chemins.push(path);
        return true;
    }
	// parcours des voisins
    var found = false;
    node.neighborhood().forEach(voisin => {
        found |= look(voisin.id(), fid, [...path]);
    });
    return found;
}


function dothepaths(){
	var p = document.getElementById("paths");
	p.innerHTML = 'Chemins<br/><input type="radio" name="path" onclick="selectpath(0);" checked />';
	for (i=1;i<chemins.length;i++){
		p.innerHTML += '<input type="radio" name="path" onclick="selectpath(' + i + ');" />';
		if (i%8==7) p.innerHTML += '<br/>';
	}
}

dotproduct = (a, b) => a.map((x, i) => a[i] * b[i]).reduce((m, n) => m + n);

function selectpath(i){
	selectedPath = i;
	cy.$('nodes').removeClass('selected');
	cy.$('edges').removeClass('selected');
	var chemin = chemins[i];
	var node = cy.$id(chemin[0]);
	var temps = 0;
	for (i=1;i<chemin.length;i++){
		var nodeTmp = cy.$id(chemin[i]);
		var arete = node.edgesWith(nodeTmp);
		console.log(arete);
		temps += parseInt(arete.data('temps'));
		console.log(temps);
		temps += dotproduct(Object.values(arete.data('obstacles')), Object.values(obstacles));
		arete.addClass('selected');
		node = nodeTmp;
		node.addClass('selected');
	}
	depart.removeClass('selected');
	arrivee.removeClass('selected');
	
	var p = document.getElementById("clock");
	p.innerHTML = 'Temps de parcours<br/><h3>' + temps + ' s</h3>';
}

function settimes(){
	var tempsD = prompt("temps de trajet par défaut ? (en secondes)", '15' );
	tempsD = parseInt(tempsD) || 15;
	cy.$('edge').forEach(edge => {
		temps = parseInt(edge.data('temps')) || 0;
		if (temps == 0){
			edge.data('temps',tempsD);
			setLabel(edge);
		}
	});
}

function unsetObstacles(){
	var p = document.getElementById('poids');
	btns = p.getElementsByTagName("button");
	for (var i = 0; i < btns.length; i++){
		btns[i].setAttribute('onclick','addO(this);');
		//btns[i].onclick = addO;
		btns[i].innerHTML = "+";
		}
	etatArete = null ;
	cy.container().classList.remove('copy');
	curTxt.innerHTML='';
	document.body.onmousemove=null;
}

function addO(button){
	unsetObstacles();
	etatArete = button.name;
	console.log(button.name);
	button.innerHTML = "...";
	button.setAttribute('onclick','unsetObstacles();');
	cy.container().classList.add('copy');
	curTxt.innerHTML=obstaclesTags[button.name];
	document.body.onmousemove=moveCursor;
}

function moveCursor(e){
    if(!e){e=window.event;}
    curTxt.style.left=e.clientX-curTxtLen[0]+15+'px';
    curTxt.style.top=e.clientY-curTxtLen[1]+15+'px';
}

function importmap(){
	cy.add(JSON.parse(savedmap));
	/*
	cy.edges().forEach(e => {
		var txt = parseInt(e.data('weight'));
		e.data('temps',txt)
		setLabel(e);});
		*/
}

function lock(){	
	cy.elements('nodes').ungrabify();
	cy.elements('nodes').lock();
	hide("locker");
	show(["weighter","poids","back2"]);
	state = "placeWeights";
}
function weighted(){
	hide(["weighter","back2","poids"]);
	show(["paths","clock","back1","chemins","poids2"]);
	unsetObstacles();
	state = "getpaths";	
}
function back1(){
	show(["weighter","back2","poids"]);
	hide(["paths","clock","back1","chemins","poids2"]);
	unsetObstacles();
	selectedPath = null;
	state = "placeWeights";	
}
function back2(){
	cy.elements('nodes').grabify();
	cy.elements('nodes').unlock();
	hide(["weighter","poids","back2"]);
	show("locker");
	state = "planning";
}

function saveImage(){
	var png64 = cy.png();
	// put the png data in an img tag
	document.querySelector('#png-eg').setAttribute('src', png64);
}

function show(ids){
	if (typeof(ids)=='string') ids=[ids];
	ids.forEach(id => {
		document.getElementById(id).classList.remove("invisible");
	});
}
function hide(ids){
	if (typeof(ids)=='string') ids=[ids];
	ids.forEach(id => {
		document.getElementById(id).classList.add("invisible");
	});
}
