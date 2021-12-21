import Coord from "./coord.mjs";
import { Color, color } from "./color.mjs";
import { Tile, TileType } from "./tile.mjs";


class GameBoard {
	#rows = 0;
	#cols = 0;
	#tile_scale = 0;

	#center = new Coord(0);
	#board_size = 0;

	#tiles = []; // Stored in column-major order
	#generated = false;

	constructor(canvas, rows, cols) {
		this.#rows = rows;
		this.#cols = cols;
		this.resize(canvas);

		for(let i = 0; i < this.#rows * this.#cols; i++) {
			const col = i % this.#cols;
			const row = Math.floor(i / this.#cols);

			this.#tiles.push(new Tile(row, col));
		}
	}

	resize(canvas) {
		this.#tile_scale = Math.min(canvas.width / this.#cols, canvas.height / this.#rows);

		this.#center = new Coord(canvas.width / 2, canvas.height / 2);
		this.#board_size = this.#tile_scale * this.#rows;
	}

	mouse_to_tile(mouse) {
		const board_start = this.#center.copy().sub(this.#board_size / 2);
		const tile_coord = mouse.copy().sub(board_start).div(this.#tile_scale).floor();

		return {
			row: tile_coord.y,
			col: tile_coord.x
		};
	}

	has_coord(coord) {
		const min = this.#center.copy().sub(this.#board_size / 2);
		const max = this.#center.copy().add(this.#board_size / 2);
		return coord.x > min.x && coord.x < max.x && coord.y > min.y && coord.y < max.y;
	}

	generate(mouse, mine_count) {
		if(this.#generated) return;
		if(mine_count >= this.#rows * this.#cols) return;

		const mouse_tile = this.mouse_to_tile(mouse);
		let mine_inds = [];

		while(mine_inds.length < mine_count) {
			const index = Math.floor(Math.random() * this.#rows * this.#cols);

			if(mine_inds.includes(index)) continue;
			if(this.#tiles[index].row === mouse_tile.row && this.#tiles[index].col === mouse_tile.col)
				continue;

			this.#tiles[index].type = TileType.Mine;
			mine_inds.push(index);
		}

		for(let r = 0; r < this.#rows; r++) {
			for(let c = 0; c < this.#cols; c++) {
				if(this.tile(r, c).type === TileType.Mine) continue;

				let neighbors = 0;

				for(let ro = -1; ro <= 1; ro++) {
					for(let co = -1; co <= 1; co++) {
						if(this.safe_tile(r + ro, c + co).type === TileType.Mine)
							neighbors++;
					}
				}

				if(neighbors > 0) {
					this.tile(r, c).type = TileType.Proximity;
					this.tile(r, c).value = neighbors;
				}
			}
		}

		this.#generated = true;
	}

	get generated() {
		return this.#generated;
	}

	tile(row, col) {
		if(row < 0 || row >= this.#rows)
			throw new RangeError(`Row is out of bounds. Min: 0, Max: ${this.#rows}`);
		if(col < 0 || col >= this.#cols)
			throw new RangeError(`Column is out of bounds. Min: 0, Max: ${this.#cols}`);

		return this.#tiles[col + row * this.#cols];
	}

	// Generates a dummy tile if `row` or `col` are out-of-bounds
	safe_tile(row, col) {
		if(row < 0 || row >= this.#rows || col < 0 || col >= this.#cols)
			return new Tile(row, col);

		return this.#tiles[col + row * this.#cols];
	}

	click(mouse, button, callback) {
		const tile_coord = this.mouse_to_tile(mouse);
		const tile = this.tile(tile_coord.row, tile_coord.col);

		if(button === 0)
			tile.reveal();
		else if(button === 2)
			tile.flag();
	}

	render(context) {
		const board_start = this.#center.copy();
		board_start.sub(this.#board_size / 2);

		Color.fill(context, color(28));
		context.fillRect(
			board_start.x,
			board_start.y,
			this.#board_size,
			this.#board_size
		);

		for(let t in this.#tiles)
			this.#tiles[t].render(context, board_start, this.#tile_scale);
	}
}


export default GameBoard;
