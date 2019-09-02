function gameOver(){
	game.paused = true;
	game.playerWhite = createSprite(game.player.position.x, game.player.position.y, 200, 200);
	game.playerWhite.shapeColor = "white";
	if(game.player.health <= 0){
		game.playerWhite.remove();
		var swalLert = Swal.fire({text: "You died.", allowEscapeKey: false,
		allowEnterKey: false,
		allowOutsideClick: false});
		remove();
		var scripts = document.getElementsByTagName("script");
		for(var i = 0; i < scripts.length; i++){
			console.log(scripts[i].src);
			if(scripts[i].src === location.href + "game.js"){
				scripts[i].parentNode.removeChild(scripts[i]);
			}
		}
		swalLert.then(function(){
			Swal.fire({
				title: "Would you like to continue this session?",
				text: "(In the interest of fun, you can't play the same level you played twice)",
				showCancelButton: true,
				cancelButtonText: "No",
				confirmButtonText: "Yes",
				type: "warning",
				allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false
			}).then(function(result){
				if(result.value){
					var saveDat = {p: game.playerTex, b: game.bulletTex, e: game.enemyTex, c: game.code};
					loadGame(saveDat);
				} else {
					Swal.fire("Alright, I'm making a new one.");
					firebase.database().ref(game.code).off('value', updateData);
		firebase.database().ref(game.code).remove();
					beginGame();
				}
			});
		});
	} else {
		setTimeout(function(){
			game.paused = false;
			game.playerWhite.remove();
		}, 50);
	}
}
function draw() {
	if(!game.paused && game.player){
  background(0);
  translate(-window.innerWidth/2, -window.innerHeight/2); //No idea why this is happening.
  shake(game.shakeAmount);
  game.player.collide(game.wallGroup);
  game.enemies.overlap(game.player, function(e, p){
  	game.player.health -= e.weapon.dmg;
		gameOver();
  });
  game.enemyBullets.overlap(game.player, function(b, p){
  	game.player.health -= 50;
  	b.remove();
  	gameOver();
  });
  game.bulGroup.overlap(game.enemies, function(b, e){
  	b.remove();
  	e.health -= game.player.weapon.dmg; //Flash white, briefly pause game.
  	game.paused = true;
  	game.white = createSprite(e.position.x, e.position.y, 200, 200);
  	game.white.shapeColor = "white";
  	setTimeout(function(){
  		game.paused = false;
  		game.white.remove();
  	}, 50);
  	if(e.health <= 0){
  		e.remove();
  	}
  });
  game.bulGroup.overlap(game.wallGroup, function(b, w){
  	b.remove();
  });
  for(var i = 0; i < game.wallGroup.length; i++){
  	var s = game.wallGroup.get(i);
  	s.position.x = game.wallGroup.position.x + s.cP.x;
  	s.position.y = game.wallGroup.position.y + s.cP.y;
  }
  for(var j = 0; j < game.enemies.length; j++){
  	var e = game.enemies.get(j);
  	e.position.x = game.enemies.position.x + e.cP.x;
  	e.position.y = game.enemies.position.y + e.cP.y;
  	if(e.fireTime > e.weapon.fireTime){
  		e.fireTime = 0;
	  	var enemyBullet = createSprite(e.position.x, e.position.y, game.TILE_SIZE/4, game.TILE_SIZE/4);
	  	var startVector = createVector(1, 0);
	  	var angle = startVector.angleBetween(createVector(e.position.x - game.player.position.x, e.position.y - game.player.position.y));
	  	var p = createVector(e.position.x - game.player.position.x, e.position.y - game.player.position.y);
	  	var cross = startVector.cross(p);
	  	angle = degrees(angle) + 180;
	  	if(game.player.position.y > e.position.y + 100){
	  		angle = angle + 180;
	  	}
	  	enemyBullet.setSpeed(game.TILE_SIZE/50, angle + random(-5, 5));
	  	enemyBullet.cP = {x: e.position.x - game.enemyBullets.position.x, y: e.position.y - game.enemyBullets.position.y};
	  	enemyBullet.life = 500;
	  	game.enemyBullets.add(enemyBullet);
  	}
		e.fireTime += 1;
  }
  for(var z = 0; z < game.enemyBullets.length; z++){
  	var b = game.enemyBullets.get(z);
  	b.position.x = game.enemyBullets.position.x + b.cP.x;
  	b.position.y = game.enemyBullets.position.y + b.cP.y;
  	b.cP.x += b.velocity.x;
  	b.cP.y += b.velocity.y;
  }
  if(keyDown("A")){
  	if(game.player.position.x - game.TILE_SIZE - 50 > 0){
			game.player.position.x -= 10;
		} else if(game.wallGroup.position.x < 1100) {
			game.wallGroup.position.x += 10;
			game.enemies.position.x += 10;
			game.enemyBullets.position.x += 10;
		}
  }
  if(keyDown("D")){
  	if(game.player.position.x + game.TILE_SIZE + 50 < window.innerWidth){
			game.player.position.x += 10;
		} else if(game.wallGroup.position.x > -1100) {
			game.wallGroup.position.x -= 10;
			game.enemies.position.x -= 10;
			game.enemyBullets.position.x -= 10;
		}
  }
  if(keyDown("W")){
  	if(game.player.position.y - game.TILE_SIZE - 50 > 0){
			game.player.position.y -= 10;
		} else if(game.wallGroup.position.y < 1100) {
			game.wallGroup.position.y += 10;
			game.enemies.position.y += 10;
			game.enemyBullets.position.y += 10;
		}
  }
  if(keyDown("S")){
  	if(game.player.position.y + game.TILE_SIZE + 50 < window.innerHeight){
			game.player.position.y += 10;
		} else if(game.wallGroup.position.y > -1100) {
			game.wallGroup.position.y -= 10;
			game.enemies.position.y -= 10;
			game.enemyBullets.position.y -= 10;
		}
  }
  if(game.canFire){
		if(keyDown(LEFT_ARROW)){
			game.direction = 180;
			fire();
		} else if(keyDown(RIGHT_ARROW)){
			game.direction = 0;
			fire();
		} else if(keyDown(UP_ARROW)){
			game.direction = -90;
			fire();
		} else if(keyDown(DOWN_ARROW)){
			game.direction = 90;
			fire();
		}
	}
  drawSprites();
  textFont("Times New Roman");
  textSize(50);
  fill(255, 255, 255);
  text("Connect on your phone at problematic-shooter.firebaseapp.com: " + game.code, 0, 50);
  textFont("Comic Sans MS");
  text(game.currentText, 0, window.innerHeight - 25);
	}
}
function shake(a){
	camera.position = {x: game.cameraOriginalPos.x + random(-a, a), y: game.cameraOriginalPos.y + random(-a, a)};
}
function fire(){
	game.canFire = false;
	var b = createSprite(game.player.position.x, game.player.position.y, game.TILE_SIZE/4, game.TILE_SIZE/4);
	b.setSpeed(game.TILE_SIZE/10, game.direction + random(-5, 5));
	b.addImage(game.bulletTexture);
	b.life = 90;
	b.rotation = game.direction;
	game.bulGroup.add(b);
	game.shakeAmount = 10;
	setTimeout(function(){
		game.shakeAmount = 0;
		camera.position = game.cameraOriginalPos;
	}, 100);
	setTimeout(function(){
			game.canFire = true;
		}, 500);
}

function drawWalls(values, w, h){
	game.wallGroup.position = {x: 0, y:0};
	game.enemies.position = {x: 0, y:0};
	for(var i = 0; i < w; i++){
		for(var j = 0; j < h; j++){
			var value = values[(i * w) + j];
			switch(value){
				case 1:
					var wall = createSprite(j * game.TILE_SIZE, i * game.TILE_SIZE, game.TILE_SIZE, game.TILE_SIZE); //To change color
					wall.cP = {x: wall.position.x, y: wall.position.y};
					game.wallGroup.add(wall);
				break;
				case 2:
					var enemy = createSprite(j * game.TILE_SIZE, i * game.TILE_SIZE, game.TILE_SIZE, game.TILE_SIZE); //To change color
					enemy.cP = {x: enemy.position.x, y: enemy.position.y};
					enemy.weapon = {
						dmg: 50,
						fireTime: random(20, 100)
					};
					enemy.fireTime = 0;
					if(game.enemyTex){
						enemy.addImage(game.enemyTex);
					}
					enemy.health = 100;
					game.enemies.add(enemy);
				break;
				case 3:
					game.wallGroup.position.x += canvas.width/4;
					game.enemies.position.x += canvas.width/4;
					game.enemies.position.y += canvas.height/4;
					game.wallGroup.position.y += canvas.height/4;
					game.wallGroup.position.x -= j * game.TILE_SIZE;
					game.wallGroup.position.y -= i * game.TILE_SIZE;
					game.enemies.position.x -= j * game.TILE_SIZE;
					game.enemies.position.y -= i * game.TILE_SIZE;
				break;
				default:
				break;
			}
		}
	}
}
function quickGen(){
	var values = [1, 0, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2];
	drawWalls(values, 5, 5);
}