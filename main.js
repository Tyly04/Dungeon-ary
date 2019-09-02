var game;

function generateCode(callback){
	game.code = "";
	for(var i = 0; i < 5; i++){
		game.code += String.fromCharCode(Math.floor(Math.random() * 25) + 65);
	}
	firebase.database().ref(game.code).once('value').then(function(dat){
		if(dat.val()){
			generateCode();
		} else {
			firebase.database().ref(game.code).onDisconnect().remove();
			callback();
		}
	});
}
window.onload = function(){
	if((function(a,b){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))window.location=b})(navigator.userAgent||navigator.vendor||window.opera,'./mobile')){
	}
	beginGame();
};
function loadGame(save){
	new p5();
	createCanvas(window.innerWidth, window.innerHeight);
	globalVars();
	game.playerTex = save.p;
	game.enemyTex = save.e;
	game.bulletTex = save.b;
	game.code = save.c;
	firebase.database.ref(game.code).set({
		code: game.code,
		text: "Waiting for another player...",
		restart: true
	});
	var script = document.createElement("script");
	script.src = "./game.js";
	document.head.appendChild(script);
	initialize();
}
function beginGame(){
	new p5();
	createCanvas(window.innerWidth, window.innerHeight);
	globalVars();
	beginDraw(" Your Protagonist (Cannot erase)", game.TILE_SIZE, game.TILE_SIZE, "white", "black", game.TILE_SIZE/50, null, function(canvDat){
		beginDraw(" Your Bullets (Forward is to the right)", game.TILE_SIZE/4, game.TILE_SIZE/4, "white", "black", game.TILE_SIZE/100, null, function(bulletDat){
			game.playerTex = datURIFromData(canvDat.canvasData, game.TILE_SIZE, game.TILE_SIZE);
			game.bulletTex = datURIFromData(bulletDat.canvasData, game.TILE_SIZE/4, game.TILE_SIZE/4);
			var script = document.createElement("script");
			script.src = "./game.js";
			generateCode(function(){
				firebase.database().ref(game.code).set({
					code: game.code,
					text: "Waiting for another player..."
				});
				firebase.database().ref(game.code).on('value', updateData);
				document.head.appendChild(script);
				initialize();
			});
		});
	});
}
var updateData = function(dat){
	var data = dat.val();
	if(data.text !== game.currentText){
		game.currentText = data.text;
	}
	if(data.enemy && !game.enemyTex){ //Ask to fill in blank spaces, starting spot.
		game.enemyTex = loadImage(data.enemy);

		game.values = data.vals;
		var num = Math.floor(data.obstacleCount * 0.1);
		var selected = [];
		var popup = gridSelect(game.values, 10, 10, " " + num + " white squares.", function(){
			var button = popup.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0];
			var container = popup.getElementsByClassName("swal2-content")[0].getElementsByClassName("container")[0];
			var actives = container.getElementsByClassName("active");
			if(actives.length === num){
				var allW = true;
				for(var i = 0; i < actives.length; i++){
					if(actives[i].style.color !== "white"){
						allW = false;
					} else {
						selected.push(actives[i].id.split(","));
					}
				}
				if(allW){
					button.disabled = false;
				} else {
					selected = [];
				}
			} else {
				button.disabled = true;
			}
		}, function(){
			selected.forEach(function(sel){
				game.values[reversePosition(game.values, parseInt(sel[0]), parseInt(sel[1]), 10, 10)] = 0;
			});
			var p = gridSelect(game.values, 10, 10, " 1 black square.", function(){
				var button = p.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0];
				var container = p.getElementsByClassName("swal2-content")[0].getElementsByClassName("container")[0];
				var actives = container.getElementsByClassName("active");
				if(container.getElementsByClassName("active").length === 1){
					if(actives[0].style.color === "black"){
						button.disabled = false;
					} else {
						selected = actives[0].id.split(",");
						button.disabled = true;
					}
				} else {
					button.disabled = true;
				}
			}, function(){
				game.values[reversePosition(game.values, parseInt(selected[0]), parseInt(selected[1]), 10, 10)] = 3;
				drawWalls(game.values, 10, 10);
			});
			var button = popup.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0];
			button.disabled = true;
		});
		var button = popup.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0];
		button.disabled = true;
	}
}
function globalVars(){
	game = {
		TILE_SIZE: 200,
		player: {},
		currentText: "",
		direction: 0,
		canFire: true,
		shakeAmount: 0,
		cameraOriginalPos: {x: 0, y:0},
		paused: true
	};
}
function initialize(){
	game.wallGroup = new Group();
	game.wallGroup.position = {x: 0, y: 0};
	game.enemies = new Group();
	game.bulGroup = new Group();
	game.enemyBullets = new Group();
	game.enemyBullets.position = {x: 0, y: 0};
	game.enemies.position = {x: 0, y:0};
	game.player = createSprite(window.innerWidth/2, window.innerHeight/2, 200, 200);
	game.player.weapon = {
		dmg: 34
	};
	game.player.health = 150;
	var tex = loadImage(game.playerTex);
	game.bulletTexture = loadImage(game.bulletTex);
	game.player.addImage(tex);
	game.paused = false;
};