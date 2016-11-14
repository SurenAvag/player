var songData;
window.onload = function(){
	$.getJSON("songs.json", function(data) {
		songData = data;
		init();
	})
}
function init(){
	songsController.init();
	playerController.init();
}
var songsController = {
	audio: new Audio(),
	source: null,
	song: [],
	isStoped: true,
	ended: function(event){
		this.stopStyle();
		isStoped = true;
	},
	playStyle: function(){
		var buttons1 = this.song[this.song.length-1].getElementsByTagName("button");
		buttons1[2].style.display = "none";
		buttons1[1].style.display = "inline-block";
		buttons1[0].style.display = "inline-block";
		if(this.song.length == 2)
			this.stopStyle.call(this);
	},
	pauseStyle: function(){
		var buttons1 = this.song[this.song.length-1].getElementsByTagName("button");
		buttons1[2].style.display = "inline-block";
		buttons1[1].style.display = "none";
		buttons1[0].style.display = "inline-block";
	},
	stopStyle: function(){
		if(this.song[0]){
			var buttons2 = this.song[0].getElementsByTagName("button");
			buttons2[2].style.display = "inline-block";
			buttons2[1].style.display = "none";
			buttons2[0].style.display = "none";
		}
	},
	handler: function(event){
		var target = event.target; 
    if(target.tagName == "I"){
    	this.song.push(target.parentNode.parentNode);
    	var src = this.getSongSrc(target); 
   	 	var funcType = "this." + target.parentNode.name + ".call(this, src)";
    	eval(funcType);
    	if(this.song.length > 1)
				this.song.shift();
    }
	},
	play: function(src){
		if(this.source == src){
			this.song.shift();
		}
		else{
			this.source = src;
			this.audio.src = src;
			this.audio.load();
		}
    this.audio.play();
		this.isStoped = false;
		this.playStyle.call(this);
	},
	pause: function(){
		this.audio.pause();
		this.pauseStyle.call(this);
		this.isStoped = false;
	},
	stop: function(){
		this.audio.load("");
		this.stopStyle.call(this);
		this.isStoped = true;
	},
	getSongSrc: function(target){
		var songName = target.parentNode.parentNode.getElementsByTagName("span")[0].innerHTML;
		var src = "songs/" + songName + ".mp3";
		return src;
	},
	getLeftSong: function(event){
		if(this.song[0])
			if(!this.song[0].previousSibling)
				return document.getElementsByTagName("li")[document.getElementsByTagName("li").length - 1];
			else
				return this.song[0].previousSibling;
		else
			return null;
	},
	getRightSong: function(event){
		if(this.song[0])
			if(!this.song[0].nextSibling)
				return document.getElementsByTagName("li")[0];
			else
				return this.song[0].nextSibling;
		else
			return null;
	},
	getChangeSong: function(event){
		if(event.target.name == "left")
			return this.getLeftSong.call(this, event);
		if(event.target.name == "right")
			return this.getRightSong.call(this, event);
	},
	addSongName: function(listItem, name){
		var text = document.createElement("span");
		text.innerHTML = name;
		text.style.textAlign = "left";
		listItem.appendChild(text);
	},
	addSign: function(button, name){
		var sign = document.createElement("i");
		sign.className = "fa fa-" + name;
		button.appendChild(sign);
	},
	addButtons: function(listItem){
		var buttons=[];
		var buttonName = ["stop", "pause", "play"];
		for(var i = 0; i < 3; i++){
			buttons.push(document.createElement("button"));
			buttons[i].name = buttonName[i];
			buttons[i].className = "all-buttons-" + buttonName[i];
			this.addSign.call(this, buttons[i], buttonName[i]);
			listItem.appendChild(buttons[i]);
		}
	},
	createList: function(wrapper){
		for(var i = 0; i < songData.length; i++){
			var listItem = document.createElement("li");
			this.addSongName.call(this, listItem, songData[i].name);
			this.addButtons.call(this, listItem);
			wrapper.appendChild(listItem);
		}
	},
	changeStyling: function(button, name){
		button.className = "angle-button fa fa-angle-"+name;
		button.style.fontSize = 24;
		button.name = name;
	},

	changeSong: function(event){
		var song = this.getChangeSong.call(this, event);
		if(!this.isStoped && song){
			event.target = song.getElementsByTagName("button")[2].getElementsByTagName("i")[0];
			var fakeEvent={target:song.getElementsByTagName("button")[2].getElementsByTagName("i")[0]};
			this.handler.call(this, fakeEvent);
		}
	},
	createChangeButtons: function(){
		var buttons = [];
		var names = ["left", "right"];
		for(var i = 0; i < 2; i++){
			buttons[i] = document.createElement("button");
			this.changeStyling(buttons[i], names[i]);
			buttons[i].addEventListener("click", this.changeSong.bind(this));
			document.getElementById("songList").appendChild(buttons[i]);
		}
	},
	init: function(){
		var listWrapper = window.document.getElementsByTagName("ol")[0];
		this.createList.call(this, listWrapper);
		this.createChangeButtons.call(this);
		this.audio.onended = this.ended.bind(this);
	  listWrapper.addEventListener("click", this.handler.bind(this));
	}
}

var playerController = {
	image: null,
	ctx: null,
	audio: songsController.audio,
	drag: false,
	timeText: function(timer, textArgs){
		if(timer.sec < 10)
	  		timer.sec = "0"+timer.sec;
	  if(timer.min < 10)
	  	timer.min = "0"+timer.min;
	  textArgs.width = 60;
	  textArgs.text =  timer.min + " : " + timer.sec;
	},
	nullTime: function(textArgs){
		textArgs.width = 60;
	  textArgs.text = "00 : 00";
	},
	getTimerText: function(timer){
		var textArgs = {text:"", width:0}
	  if(isNaN(timer.min) || songsController.isStoped || (timer.sec == 0 && timer.min == 0))
	  	this.nullTime(textArgs);
	  else
	  	this.timeText(timer, textArgs);
	  return textArgs;
	},
	drawTimerCircle: function(time){
	  this.ctx.strokeStyle = "white";
	  this.ctx.arc(85, 85, 70, 1.5 * Math.PI, (1.5 + time * 2) * Math.PI);
	  this.ctx.stroke();
	  this.ctx.beginPath();
	  this.ctx.strokeStyle ="black";
	  this.ctx.arc(85, 85, 70, (1.5 + time * 2) * Math.PI, 1.5 * Math.PI);
	  this.ctx.stroke();
	},
	drawPoint: function(angle){
		var x = 80 + 70 * Math.cos(angle * Math.PI / 180);
	  var y = 80 + 70 * Math.sin(angle * Math.PI / 180);
	  this.image.update(x, y);
	},
	setPoint: function(){
		if(!isNaN(this.audio.currentTime) && !this.audio.paused && this.audio.currentTime != undefined && this.audio.currentTime != this.audio.duration)
		  this.drawPoint.call(this, this.audio.currentTime * (360 / this.audio.duration) - 90);
	  else if(this.audio.paused && !songsController.isStoped && this.audio.currentTime != undefined && this.audio.currentTime != this.audio.duration)
	  	this.timeFromPoint.call(this);
	  else if(this.audio.currentTime == this.audio.duration - 1){
	  	this.audio.src = " ";
	  	this.audio.load(" ");
	  }
	},
	timeFromPoint: function(){
		if(!isFinite(this.image.x) || !isFinite(this.image.y))
			return;
		this.image.update();
  	var angle = 180 * Math.acos(((this.image.x - 80) / 70) % Math.PI) / Math.PI ;	
  	if(this.image.y < 70 && this.image.x > 70)  angle *= -1; 
  	if(this.image.y < 70 && this.image.x < 70)	angle = angle += (180 - angle) * 2;
  	this.audio.currentTime = (angle + 90) * this.audio.duration / 360;
	},
  timer: function(){
  	var time = this.audio.duration - this.audio.currentTime;
	  var timer = {sec: Math.round(time % 60), min: ((time-time % 60) / 60).toFixed()};
	  this.ctx.fillStyle = "white";
		this.ctx.fillRect(0, 0, 500, 500);
		this.createOvals.call(this);
		this.ctx.fillStyle = "black";
	  this.ctx.fillText(this.getTimerText(timer).text,this.getTimerText(timer).width , 90);
	  this.drawTimerCircle.call(this, this.audio.currentTime / this.audio.duration);
	  if(this.audio.currentTime) 
	  	this.setPoint.call(this);
  },
	painter: function(canvas){
		this.ctx = canvas.getContext("2d");
		this.ctx.beginPath();
		this.setTime.call(this);
		this.createOvals.call(this);	
		this.ctx.stroke();
	},
	createOvals: function(){
		this.ctx.beginPath();
		this.ctx.arc(85, 85, 55, 0, 2 * Math.PI);
		this.ctx.stroke();
		this.ctx.beginPath();
	},
	setTime: function(){
		this.ctx.font = "17px Arial";
		this.ctx.fillText("00 : 00", 50, 80);
		setInterval(this.timer.bind(this), 30);
	},
	setMouseOffset: function(e){
		this.mouse.x = e.offsetX;
		this.mouse.y = e.offsetY;
	},
	docMouseDown: function(e){
		this.mouse.pressed = true;
		if(this.audio.currentTime)
			playerController.drag = true;
	},
	docMouseUp: function(e){
		this.mouse.pressed = false;
		if(playerController.drag == true){
			songsController.playStyle();
			playerController.audio.play();
		}
	},
	xLong: function(x, y, r){
		var z = x;
		x = Math.sqrt(r * r - y * y);
		if(z < 0)
		 	x *= -1;
		return {"x" : x, "y" : y};
  },
	yLong: function (x, y, r){
	  var z = y;
	  y = Math.sqrt(r * r - x * x);
	  if(z < 0)
	  	y *= -1;
	  return {"x" : x, "y" : y};
	},
	twoShort: function(x, y, r){
		var z = x;
    x = Math.sqrt(r * r - y * y);
    if(z < 0)
    	x *= -1;
    return {"x" : x, "y" : y};
	},
	getXY: function(x, y, distance, r){
		if(distance == r)	return {"x" : x, "y" : y};
  	if(Math.abs(x) > r && Math.abs(y) > r){
  		x = x % r;
  		return playerController.getXY(x, y, distance, r);
  	}
  	if(Math.abs(x) >= r) return playerController.xLong(x, y, r);
  	if(Math.abs(y) >= r) return playerController.yLong(x, y, r);
  	if(Math.abs(y) <= r && Math.abs(x) <= r) return playerController.twoShort(x, y, r);
  	return {"x" : x, "y" : y};
	},
	noDrag: function(){
		this.startX = this.mouse.x - this.x;
    this.startY = this.mouse.y - this.y;
	},
	pointerMousePressed: function(){
		var left = this.x;
    var right = this.x + this.img.width;
    var top = this.y;
    var bottom = this.y + this.img.height;
    if (!this.drag)
    	playerController.noDrag.call(this);
    if (this.mouse.x < right && this.mouse.x > left && this.mouse.y < bottom && this.mouse.y > top){
       songsController.pause();
       this.drag = true;
     }
	},
	onDrag: function(newXY){
		this.x = newXY.x;
    this.y = newXY.y;
	},
	changeXY: function(){
		var centerX = 80, centerY = 80;
    var r = 70;
    var imgX = this.mouse.x - this.startX - centerX;
    var imgY = this.mouse.y - this.startY - centerY;
    var distance = Math.sqrt(imgX * imgX + imgY * imgY);
    var newXY = playerController.getXY(imgX, imgY, distance, r);
    newXY.x += centerX;
    newXY.y += centerY;
    return newXY;
	},
	myUpdate: function(x = null, y = null){
		if (this.mouse.pressed)
      playerController.pointerMousePressed.call(this);
    else
      this.drag = false;
    var newXY = playerController.changeXY.call(this);
    if (this.drag) 
    	playerController.onDrag.call(this, newXY);
    if(x != null){
    	this.x = x;
    	this.y = y;
    	this.drag = true;
    }
    this.ctx.drawImage(this.img, this.x, this.y, 10, 10);
    this.ctx.stroke();
    this.ctx.beginPath();
	},
	DragImage: function(src, x, y, mouse, ctx) {
    this.startX = 0, this.startY = 0;
    this.x = x, this.y = y;
    this.ctx = ctx;
    this.mouse = mouse;
    this.drag = false;
    this.img = new Image();
    this.img.src = src;
    this.update = playerController.myUpdate.bind(this);
	},
	pointerInit: function(canvas){
		this.mouse = {"x" : 0, "y" : 0, "mousePressed" : false, pressed: false};
		canvas.onmousemove = this.setMouseOffset.bind(this);  
		document.onmousedown = this.docMouseDown.bind(this);
		document.onmouseup = this.docMouseUp.bind(this);
		var path = "circle.png";
		var mouse = {"x" : 0, "y" : 0, "mousePressed" : false};
		this.image = new this.DragImage(path, 70, 0, this.mouse, this.ctx);
	},
	init:function(){
		var canvas = document.getElementById("myCanvas");
		this.painter.call(this, canvas);
		this.pointerInit.call(this, canvas);
  }
}