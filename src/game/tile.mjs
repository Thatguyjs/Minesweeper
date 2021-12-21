import Coord from "./coord.mjs";
import { Color, color } from "./color.mjs";


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
		if(this.state === TileState.Flagged)
			return false;

		this.state = TileState.Visible;
		return true;
	}

	flag() {
		if(this.state === TileState.Visible)
			return false;

		if(this.state === TileState.None)
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

		context.fillRect(start.x + 2, start.y + 2, tile_scale - 4, tile_scale - 4);

		if(this.state === TileState.Flagged) {
			Color.fill(context, color(200, 20, 50));
			context.fillRect(start.x + tile_scale / 4, start.y + tile_scale / 4, tile_scale / 2, tile_scale / 2);
		}
		else if(this.state === TileState.Visible) {
			if(this.type === TileType.Proximity) {

			}
			else if(this.type === TileType.Mine) {
				Color.fill(context, color(20));
				context.fillRect(start.x + tile_scale / 4, start.y + tile_scale / 4, tile_scale / 2, tile_scale / 2);
			}
		}
	}
}


export { Tile, TileType };
