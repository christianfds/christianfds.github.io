class Vec2{
	constructor(x,y){
		this.x = x;
		this.y = y;
	}

	get x(){
		return this._x;
	}
	set x(value){
		this._x = value;  
	}

	get y(){
		return this._y;
	}
	set y(value){
		this._y = value;  
	}

	neg(){
		this.x = -this.x;
		this.y = -this.y;
	}

	add(value1,value2){
		if(value2 != undefined){
			this.x += value1;
			this.y += value2;
		}
		else if(value1 instanceof Vec2){
			this.x += value1.x;
			this.y += value1.y;
		}
		else if(typeof value1 === "number"){
			this.x += value1;
			this.y += value1;
		}
	}

	sub(value1,value2){
		if(value2 != undefined){
			this.x -= value1;
			this.y -= value2;
		}
		else if(value1 instanceof Vec2){
			this.x -= value1.x;
			this.y -= value1.y;
		}
		else if(typeof value1 === "number"){
			this.x -= value1;
			this.y -= value1;
		}
	}

	mul(value1,value2){
		if(value2 != undefined){
			this.x *= value1;
			this.y *= value2;
		}
		else if(value1 instanceof Vec2){
			this.x *= value1.x;
			this.y *= value1.y;
		}
		else if(typeof value1 === "number"){
			this.x *= value1;
			this.y *= value1;
		}
	}

	div(value1,value2){
		if(value2 != undefined){
			this.x /= value1;
			this.y /= value2;
		}
		else if(value1 instanceof Vec2){
			this.x /= value1.x;
			this.y /= value1.y;
		}
		else if(typeof value1 === "number"){
			this.x /= value1;
			this.y /= value1;
		}
	}

	dist(value){
		if(value instanceof Vec2){
			var dx = value.x - this.x;
			var dy = value.y - this.y;
			return Math.sqrt(dx * dx + dy * dy);
		}
		return 0;
	}

	f(){
		return Math.sqrt(this.x * this.x + this.y * this.y);
	}

	clone(){
		return new Vec2(this.x, this.y);
	} 

	toString() {
		return "{" + Math.floor(this.x*1000)/1000 + ", " + Math.floor(this.y*1000)/1000 + "}";
	}

	rotate(rad){
		let old_x = this.x;
		let old_y = this.y;

		this.x = + old_x*Math.cos(rad) - old_y*Math.sin(rad);
		this.y =   old_x*Math.sin(rad) + old_y*Math.cos(rad) ;
	}

	getangle(){
		return Math.atan2(this.x,this.y);
	}
}