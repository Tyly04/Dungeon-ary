var mouseClick = false;
function beginDraw(text, width, height, color, background, size, scale, callback){
	var canvasData;
	var alertFire = Swal.fire({title: "Draw" + text, width: window.innerWidth/2, height: 3 * window.innerHeight/4, allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false});
	alertFire.then(function(){
		if(scale){
			return convertToScaledPixel(drawCanvas, context, scale, callback);
		}
		if(!scale){callback({canvasData: canvasData});}
	});
	var popup = Swal.getPopup();
	var content = popup.getElementsByClassName("swal2-content")[0];
	var drawCanvas = document.createElement("canvas");
	drawCanvas.id = "drawCanvas";
	drawCanvas.style.border = "1px dashed black";
	drawCanvas.width = width;
	drawCanvas.height = height;
	var context = drawCanvas.getContext("2d");
	context.fillStyle = background;
	context.fillRect(0, 0, drawCanvas.width, drawCanvas.height);
	content.appendChild(drawCanvas);
	context.fillStyle = color;
	drawCanvas.onmousedown = function(){
		mouseClick = true;
	};
	drawCanvas.ontouchstart = function(){
		mouseClick = true;
	};
	drawCanvas.ontouchstop = function(){
		mouseClick = false;
	};
	drawCanvas.onmouseup = function(){
		mouseClick = false;
	};
	drawCanvas.ontouchmove = function(e){
		if(mouseClick){
			var rect = drawCanvas.getBoundingClientRect();
			context.moveTo(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top);
			context.ellipse(e.touches[0].clientX - rect.left, e.touches[0].clientY - rect.top, size, size, 0, 0, Math.PI * 2);
			context.fill();
		}
		canvasData = context.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
	};
	drawCanvas.onmousemove = function(e){
		if(mouseClick){
			var rect = drawCanvas.getBoundingClientRect();
			context.moveTo(e.x - rect.left, e.y - rect.top);
			context.ellipse(e.x - rect.left, e.y - rect.top, size, size, 0, 0, Math.PI * 2);
			context.fill();
		}
		canvasData = context.getImageData(0, 0, drawCanvas.width, drawCanvas.height);
	};
}

function getPosition(gridArr, selCol, w, h){ //Filter Arr is 2d. selCol is the index in the grid array. Filter arr is composed of 0s and 1s. Can be customized for only selectable squares.
	for(var i = 0; i < h; i++){
		for(var j = 0; j < w; j++){
			if((i * w) + j === selCol){
				return {x: j, y: i};
			}
		}
	}
}
function reversePosition(gridArr, x, y, w, h){
	for(var i = 0; i < h; i++){
		for(var j = 0; j < w; j++){
			if(x === j && y === i){
				return (i * w) + j;
			}
		}
	}
}
function gridSelect(array, width, height, text, activeCallback, callback){
	var grid = Swal.fire({title: "Select " + text, allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false}).then(function(){
		if(callback){
			callback(popup);
		}
	});
	var popup = Swal.getPopup();
	var content = popup.getElementsByClassName("swal2-content")[0];
	var container = document.createElement("div");
	container.className = "container";
	content.appendChild(container);
	var arr = [];
	for(var j = 0; j < height; j++){
		var row = document.createElement("div");
		row.className = "row";
		for(var i = 0; i < width; i++){
			var col = document.createElement("div");
			col.className = "col-sm";
			col.innerText = "X";
			col.style.width = "50px";
			col.style.height = "50px";
			col.id = i + "," + j;
			col.onclick = function(){if(this.style.backgroundColor === "green"){this.style.backgroundColor = this.style.color; this.className="col-sm";} else{ this.style.backgroundColor = "green";  this.className = "col-sm active";} activeCallback();};
			col.style.border = "1px solid grey";
			switch(array[(j * width) + i]){
				case 0:
					col.style.backgroundColor = 'black';
					col.style.color = 'black';
				break;
				case 1:
					col.style.backgroundColor = 'white';
					col.style.color = "white";
				break;
				case 2:
					col.style.backgroundColor = 'red';
					col.style.color = 'red';
				break;
			}
			arr.push(col);
			row.appendChild(col);
		}
		container.appendChild(row);
	}
	return popup;
}


function convertToScaledPixel(canvas, context, scale, callback){ //Should be if alpha value > 127.5, get pixel.
	var pixels = context.getImageData(0, 0, canvas.width, canvas.height); //The total map size should be... I think 10 x 10 is good for now. If we're starting out with a width of 500 x 500, we need to divide by 50. So 2500 pixels at a time.
	var pxR = pixels.data;
	var pixelArray = pxR.filter(function(currentValue, index){ //Get only alpha values (WAIT, THAT DOESN'T WORK. Need to find some way to just represent the... oh, I got it.) If we're just representing in values of black and white, I can remove the "+1" to get the last color value of each element.
		return (index) % 4 === 0;
	}); //Each pixel takes 4 slots in the array.
	var scale = scale;
	var valArray = [];
	var currentCol = 0;
	var currentRow = 0;
	while(currentRow < canvas.height * canvas.width){
		var averageValue = 0;
		for(var j = 0; j < scale; j++){
			for(var i = 0; i < scale; i++){
				var value = pixelArray[(currentCol + i) + (j + currentRow)];
				averageValue += value; //(Current Row position) + (Current Column Position)
			}
		}
		valArray.push(averageValue/Math.pow(scale, 2));
		currentCol += scale;
		if(currentCol >= canvas.width){
			currentRow += canvas.width * scale; //Increase by 1
			currentCol = 0;
		}
	}
	callback({values: valArray, pixels: pxR});
	return {values: valArray, pixels: pxR};
}

function createBlobFromScaled(imgData, w, h){ //Meant to be worked with convertToScaledPixel.
	var canv = document.createElement("canvas");
	canv.style.display = "none";
	var ctx = canv.getContext("2d");
	var currentWidth = 0;
	var currentHeight = 0;
	ctx.fillStyle = "black";
	imgData.forEach(function(pxl){
		ctx.fillRect(currentWidth, currentHeight, 1, 1);
		currentWidth += 1;
		if(currentWidth > w){
			currentHeight += 1;
		}
	});
	canv.toBlob(function(blob){
		canv.parentElement.removeChild(canv);
		return blob;
	});
}
function createBlobFromData(imgData, w, h, callback){
	var canv = document.createElement("canvas");
	document.body.appendChild(canv);
	canv.width = w;
	canv.height = h;
	canv.style.display = "none";
	var ctx = canv.getContext("2d");
	ctx.putImageData(imgData, 0, 0);
	canv.toBlob(callback);
}
function datURIFromData(imgData, w, h){
	var canv = document.createElement("canvas");
	document.body.appendChild(canv);
	canv.width = w;
	canv.height = h;
	canv.style.display = "none";
	var ctx = canv.getContext("2d");
	ctx.putImageData(imgData, 0, 0);
	return canv.toDataURL();
}
function getRandomName(){
	var arr = ["Clown", "Door", "Christmas Tree", "Bike", "Caricature", "Big Eye", "Collection of five items you use the most", "Picture of this exhibition", "Review of this game",
	"Website", "Thought", "Cloud", "Utensil", "Happy Place", "Sad Place", "Creativity", "Good Movie", "Bad Movie", "Picture of your favorite artist", "Picture of your favorite director", 
	"Self-Portrait", "Phone", "Picture of a thing you saw before you came here", "Fancy letter", "Great example of Proper capitalization", "Body Part", "Song", "ll the colors of the wind",
	"Better game", "Keyboard", "Large imitation of the player character", "Picasso", "Mozart"];
	return arr[Math.floor(Math.random() * arr.length)];
}