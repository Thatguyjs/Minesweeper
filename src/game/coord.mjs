class Coord {
	constructor(x, y) {
		this.x = x ?? 0;
		this.y = y ?? this.x;
	}

	add(x, y) {
		if(x instanceof Coord)
			return this.add(x.x, x.y);

		this.x += x;
		this.y += y ?? x;
		return this;
	}

	sub(x, y) {
		if(x instanceof Coord)
			return this.sub(x.x, x.y);

		this.x -= x;
		this.y -= y ?? x;
		return this;
	}

	mult(x, y) {
		if(x instanceof Coord)
			return this.div(x.x, x.y);

		this.x *= x;
		this.y *= y ?? x;
		return this;
	}

	div(x, y) {
		if(x instanceof Coord)
			return this.div(x.x, x.y);

		this.x /= x;
		this.y /= y ?? x;
		return this;
	}

	floor() {
		this.x = Math.floor(this.x);
		this.y = Math.floor(this.y);
		return this;
	}

	round() {
		this.x = Math.round(this.x);
		this.y = Math.round(this.y);
		return this;
	}

	ceil() {
		this.x = Math.ceil(this.x);
		this.y = Math.ceil(this.y);
		return this;
	}

	copy() {
		return new Coord(this.x, this.y);
	}

	static copy(coord) {
		if(!coord instanceof Coord)
			throw new TypeError("Failed to copy: Not a Coord instance");

		return coord.copy();
	}
}


export default Coord;
