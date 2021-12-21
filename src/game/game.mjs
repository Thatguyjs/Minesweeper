import Coord from "./coord.mjs";
import GameBoard from "./board.mjs";


const Difficulty = {
	Easy: 0,
	Medium: 1,
	Hard: 2,
	Custom: 3,

	board_size(difficulty) {
		switch(difficulty) {
			case Difficulty.Easy:
				return [9, 9];
			case Difficulty.Medium:
				return [16, 16];
			case Difficulty.Hard:
				return [16, 30];
			default:
				return null;
		}
	},

	mine_count(difficulty) {
		switch(difficulty) {
			case Difficulty.Easy:
				return 10;
			case Difficulty.Medium:
				return 40;
			case Difficulty.Hard:
				return 99;
			default:
				return null;
		}
	}
};

const GameState = {
	None: 0,
	Active: 1,
	Lose: 2,
	Win: 3
};

const GameEvent = {
	Lose: 1,
	Win: 2
};


const Game = {
	canvas: null,
	context: null,

	difficulty: Difficulty.Easy,
	board: null,

	state: GameState.None,

	init(canvas, context, options) {
		this.canvas = canvas;
		this.context = context;
		this.reset(options);
	},

	reset(options) {
		this.difficulty = options?.difficulty ?? Difficulty.Medium;
		this.board = new GameBoard(this.canvas, ...Difficulty.board_size(this.difficulty));
		this.resize_canvas();

		this.state = GameState.Active;
	},

	resize_canvas() {
		this.canvas.width = this.canvas.offsetWidth;
		this.canvas.height = this.canvas.offsetHeight;
		this.board.resize(this.canvas);
	},

	update(event) {
		const mouse = new Coord(event.offsetX, event.offsetY);
		if(!this.board.has_coord(mouse)) return;

		if(!this.board.generated)
			this.board.generate(mouse, Difficulty.mine_count(this.difficulty));

		if(this.state === GameState.Active)
			this.board.click(mouse, event.button, this.event_callback.bind(this));
	},

	event_callback(event) {
		if(event === GameEvent.Lose) {
			this.dispatch('lose');
			this.state = GameState.Lose;
		}
		else {
			this.dispatch('win');
			this.state = GameState.Win;
		}
	},

	dispatch(event_name, event_data=null) {
		window.dispatchEvent(new CustomEvent(`game:${event_name}`, {
			detail: event_data
		}));
	},

	render() {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.board.render(this.context);
	}
};


export { Game, Difficulty, GameEvent };
