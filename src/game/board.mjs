import Coord from "./coord.mjs";
import { Color, color } from "./color.mjs";
import { GameEvent } from "./game.mjs";
import { Tile, TileType, TileState } from "./tile.mjs";


class GameBoard {
	#rows = 0;
	#cols = 0;
	#tile_scale = 0;

	#center = new Coord(0);
	#board_size = new Coord(0);

	#tiles = []; // Stored in column-major order
	#mine_count = 0;
	#generated = false;

	#tiles_visible = 0;
	#tiles_flagged = 0;

	constructor(canvas, rows, cols, mine_count) {
		this.#rows = rows;
		this.#cols = cols;
		this.#mine_count = mine_count;

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
		this.#board_size = new Coord(this.#cols, this.#rows);
		this.#board_size.mult(this.#tile_scale);
	}

	mouse_to_tile(mouse) {
		const board_start = this.#center.copy().sub(this.#board_size.copy().div(2));
		const tile_coord = mouse.copy().sub(board_start).div(this.#tile_scale).floor();

		return {
			row: tile_coord.y,
			col: tile_coord.x
		};
	}

	has_coord(coord) {
		const min = this.#center.copy().sub(this.#board_size.copy().div(2));
		const max = this.#center.copy().add(this.#board_size.copy().div(2));
		return coord.x > min.x && coord.x < max.x && coord.y > min.y && coord.y < max.y;
	}

	generate(mouse) {
		if(this.#generated) return;
		if(this.#mine_count >= this.#rows * this.#cols) return;

		const mouse_tile = this.mouse_to_tile(mouse);
		let mine_inds = [];

		while(mine_inds.length < this.#mine_count) {
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

				for(let ro = -1; ro <= 1; ro++)
					for(let co = -1; co <= 1; co++)
						if(this.safe_tile(r + ro, c + co).type === TileType.Mine)
							neighbors++;

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

	click(mouse, button, event_callback) {
		const tile_coord = this.mouse_to_tile(mouse);
		const tile = this.tile(tile_coord.row, tile_coord.col);
		let revealed = false;

		if(button === 0) {
			if(tile.state === TileState.Visible) {
				let f_neighbors = 0;

				for(let r = -1; r <= 1; r++)
					for(let c = -1; c <= 1; c++)
						if(this.safe_tile(tile_coord.row + r, tile_coord.col + c).state === TileState.Flagged)
							f_neighbors++;

				// Reveal surrounding tiles
				if(tile.value === f_neighbors) {
					for(let r = -1; r <= 1; r++) {
						for(let c = -1; c <= 1; c++) {
							if(tile_coord.row + r < 0 || tile_coord.row + r >= this.#rows) continue;
							if(tile_coord.col + c < 0 || tile_coord.col + c >= this.#cols) continue;

							const neighbor = this.safe_tile(tile_coord.row + r, tile_coord.col + c);

							if(neighbor.reveal()) {
								this.#tiles_visible++;

								if(neighbor.type === TileType.Blank)
									this.#reveal_area(neighbor);

								if(neighbor.type === TileType.Mine) {
									event_callback(GameEvent.Lose);
									return;
								}
							}
						}
					}
				}
			}
			else if(revealed = tile.reveal()) this.#tiles_visible++;
		}
		else if(button === 2) {
			if(tile.flag()) {
				if(tile.state === TileState.Flagged) this.#tiles_flagged++;
				else this.#tiles_flagged--;
			}
		}

		// Player clicked a mine
		if(tile.type === TileType.Mine && revealed) {
			event_callback(GameEvent.Lose);
			return;
		}

		// Simple boundary-fill
		if(tile.type === TileType.Blank && revealed) {
			this.#reveal_area(tile);
		}

		// Check for a win
		if(this.#tiles_visible === this.#rows * this.#cols - this.#mine_count && this.#tiles_flagged === this.#mine_count)
			event_callback(GameEvent.Win);
	}

	#reveal_area(start_coord) {
		if(start_coord.row < 0 || start_coord.row >= this.#rows) return;
		if(start_coord.col < 0 || start_coord.col >= this.#cols) return;

		const tile = this.tile(start_coord.row, start_coord.col);
		if(tile.type !== TileType.Blank) return;

		let searching = [];

		for(let r = -1; r <= 1; r++)
			for(let c = -1; c <= 1; c++)
				searching.push(new Coord(tile.col + c, tile.row + r));

		while(searching.length) {
			const search = searching.pop();
			if(search.x < 0 || search.x >= this.#cols || search.y < 0 || search.y >= this.#rows)
				continue;

			const search_tile = this.tile(search.y, search.x);

			if(search_tile.state === TileState.Visible)
				continue;

			if(search_tile.state === TileState.Flagged) {
				search_tile.flag();
				this.#tiles_flagged--;
			}
			if(search_tile.reveal())
				this.#tiles_visible++;

			if(search_tile.type === TileType.Blank) {
				for(let r = -1; r <= 1; r++)
					for(let c = -1; c <= 1; c++)
						searching.push(new Coord(search.x + c, search.y + r));
			}
		}
	}

	reveal_mines() {
		for(let t in this.#tiles) {
			if(this.#tiles[t].type === TileType.Mine) {
				this.#tiles[t].flag(false);
				this.#tiles[t].reveal();
			}
		}
	}

	render(context) {
		const board_start = this.#center.copy();
		board_start.sub(this.#board_size.copy().div(2));

		Color.fill(context, color(28));
		context.fillRect(
			board_start.x,
			board_start.y,
			this.#board_size.x,
			this.#board_size.y
		);

		for(let t in this.#tiles)
			this.#tiles[t].render(context, board_start, this.#tile_scale);
	}
}


export default GameBoard;
