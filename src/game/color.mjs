// Color utilities


class Color {
	constructor(r, g, b, a) {
		a = a ?? (b === undefined ? g : null) ?? 255;
		g = b !== undefined ? g : r;
		b = b ?? r;

		this.r = r;
		this.g = g;
		this.b = b;
		this.a = a;
	}

	static from(...color) {
		if(color[0] instanceof Color)
			return color[0];
		if(Array.isArray(color[0]))
			return new Color(...color[0]);
		if(typeof color[0] === 'object')
			return new Color(color[0].r, color[0].g, color[0].b, color[0].a);
		if(typeof color[0] === 'number')
			return new Color(...color);

		throw new TypeError(`Could not convert "${color[0]}" to a Color instance`);
	}

	static fill(context, color) {
		color = Color.from(color);
		context.fillStyle = color.as_string();
	}

	static stroke(context, color) {
		color = Color.from(color);
		context.strokeStyle = color.as_string();
	}

	as_string() {
		return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a})`;
	}

	toString() {
		return this.as_string();
	}
}


function color(...args) {
	return Color.from(...args);
}


export { Color, color };
