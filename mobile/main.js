var code;
function connect(code){
	if(!code){
		code = $("#sessionCode").val().toUpperCase();
	}
		try{
		firebase.database().ref(code).once('value').then(function(dat){
			if(dat.val()){
				Swal.fire({type: "success", text: "Connected.", allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false}).then(function(){
					beginDraw(" Your Ideal Bad Guy", 200, 200, "red", "black", 4, null, function(dat){
						beginDraw(" A " + getRandomName(), 500, 500, "white", "black", 20, 50, function(val){ //Returns things a little differently. I'm generating the level before I draw it.
							var values = val.values;
							var obstacleCount = 0;
							values.forEach(function(value, index){
								if(value > 255 * 0.4){ //White is a block
									values[index] = 1; //Simple scheme. 1 = Block. 0 = Empty. 2 = Enemy. 3 = Exit. 4-Math.Infinity = Whatever else.
									obstacleCount += 1;
								} else {
									values[index] = 0;
								}
							});
							var num = Math.ceil((100 - obstacleCount) * 0.1);
							var selected = [];
							var popup = gridSelect(values, 10, 10, " " + num + " black squares.", function(){
								var container = popup.getElementsByClassName("swal2-content")[0].getElementsByClassName("container")[0];
								var actives = container.getElementsByClassName("active");
								var button = popup.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0];
								button.disabled = true;
								if(actives.length === num){
									var allB = true;
									console.log(actives);
									for(var i = 0; i < actives.length; i++){
										var e = actives[i];
										if(e.style.color === "white"){
											allB = false;
										}
										selected.push(e.id.split(","));
									}
									if(allB){
										button.disabled = false;
									} else {
										selected = [];
									}
								} else {
									button.disabled = true;
								}
							}, function(){
								selected.forEach(function(sel){
									values[reversePosition(values, parseInt(sel[0]), parseInt(sel[1]), 10, 10)] = 2;
								});
								$("#codeEnter")[0].style.display = "none";
								$("#interaction")[0].style.display = "inline";
								var url = datURIFromData(dat.canvasData, 200, 200);
									firebase.database().ref(code).update({
										text: "",
										enemy: url,
										vals: values,
										obstacleCount: obstacleCount
									});	
								firebase.database().ref(code).on('value', updateDat);
							});
							popup.getElementsByClassName("swal2-actions")[0].getElementsByClassName("swal2-confirm")[0].disabled = true;
						});
					});
				});
			} else {
				Swal.fire({type: "error", text: "Code not found. Please try again.", allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false});
			}
		}).catch(function(err){
			Swal.fire({type: "error", text: err, allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false});
		});
		} catch (error){
			Swal.fire({type: "error", text: error, allowEscapeKey: false,
				allowEnterKey: false,
				allowOutsideClick: false});
		}
}
window.onload = function(){
	$("#message").click(function(){
		var text = Swal.fire({type: "question", title: "Enter in a message", input: "text"})
		text.then(function(dat){
			firebase.database().ref(code + "/text/").set(dat.value);
		});
	});
};

var updateDat =	function(dat){
	var data = dat.val();
	if(!data){
		code = "";
		$("#interaction")[0].style.display = "none";
		$("#codeEnter")[0].style.display = "inline";
	}
	if(data.restart){
		firebase.database().ref(code + "/restart").set({});
		firebase.database().ref(code).off('value', updateDat);
		connect(code);
	}
}