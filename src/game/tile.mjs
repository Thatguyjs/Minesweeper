import { Color, color } from "./color.mjs";


function neighbor_color(neighbors) {
	switch(neighbors) {
		case 1:
			return color(20, 90, 255);
		case 2:
			return color(0, 220, 0);
		case 3:
			return color(220, 0, 0);
		case 3:
			return color(255, 0, 255);
		default:
			return color(200);
	}
}

const TileType = {
	Blank: 0,
	Proximity: 1,
	Mine: 2
};

const TileState = {
	None: 0,
	Visible: 1,
	Flagged: 2
};


class Tile {
	constructor(row, col, type, state) {
		this.row = row;
		this.col = col;
		this.type = type ?? TileType.Blank;
		this.state = state ?? TileState.None;
		this.value = 0; // Only used for Proximity tiles
	}

	reveal() {
		if(this.state !== TileState.None)
			return false;

		this.state = TileState.Visible;
		return true;
	}

	flag(set_flag) {
		if(this.state === TileState.Visible)
			return false;

		if(set_flag !== undefined)
			this.state = set_flag ? TileState.Flagged : TileState.None;
		else if(this.state === TileState.None)
			this.state = TileState.Flagged;
		else
			this.state = TileState.None;

		return true;
	}

	render(context, offset, tile_scale) {
		let start = offset.copy();
		start.add(tile_scale * this.col, tile_scale * this.row);

		Color.fill(context, color(40));
		if(this.state === TileState.Visible && this.type === TileType.Blank)
			Color.fill(context, color(60));

		context.fillRect(start.x + 1, start.y + 1, tile_scale - 2, tile_scale - 2);

		if(this.state === TileState.Flagged) {
			Color.fill(context, color(200, 20, 50));
			context.fillRect(start.x + tile_scale / 4, start.y + tile_scale / 4, tile_scale / 2, tile_scale / 2);
		}
		else if(this.state === TileState.Visible) {
			if(this.type === TileType.Proximity) {
				Color.fill(context, neighbor_color(this.value));
				context.textAlign = "center";
				context.textBaseline = "middle";
				context.font = `${tile_scale / 4 + 10}px sans-serif`;
				context.fillText(this.value.toString(), start.x + tile_scale / 2, start.y + tile_scale / 2 + 2);
			}
			else if(this.type === TileType.Mine) {
				Color.fill(context, color(20));
				context.fillRect(start.x + tile_scale / 4, start.y + tile_scale / 4, tile_scale / 2, tile_scale / 2);
			}
		}
	}
}


export { Tile, TileType, TileState };
