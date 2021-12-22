import { Game, Difficulty } from "./game/game.mjs";


const Options = {
	state: {},
	display: {},
	listeners: [],

	init() {
		const all_opts = [...document.querySelectorAll('.option')];

		for(let o in all_opts) {
			const name = this.option_name(all_opts[o].id);
			this.state[name] = this.get_state(name, all_opts[o]);

			all_opts[o].addEventListener('input', this._option_change.bind(this, name));
		}

		const all_displays = [...document.querySelectorAll('.display')];

		for(let d in all_displays) {
			const name = this.display_name(all_displays[d].id);
			this.display[name] = all_displays[d];
		}

		this.update();
	},

	_name(id, prefix) {
		if(!id.startsWith(prefix)) return null;
		return id.slice(prefix.length);
	},

	option_name(option_id) {
		return this._name(option_id, 'option:');
	},

	display_name(display_id) {
		return this._name(display_id, 'display:');
	},

	_option_change(name, ev) {
		this.state[name] = this.get_state(name, ev.target);
		this.update();

		for(let l in this.listeners) {
			this.listeners[l].callback(name);

			if(this.listeners[l].once)
				this.listeners[l] = null;
		}

		this.listeners = this.listeners.filter(item => item !== null);
	},

	on_update(callback, once=false) {
		this.listeners.push({ once, callback });
	},

	get_state(option_name, element=null) {
		element ??= document.getElementById('option:' + option_name);
		if(!element) return null;

		switch(option_name) {
			case 'difficulty':
				return element.value;

			case 'board-rows':
			case 'board-cols':
			case 'board-mines':
				return +element.value;
		}
	},

	state_value(option_name) {
		const state = this.get_state(option_name);

		if(option_name === 'difficulty') {
			switch(state) {
				case 'easy':
					return Difficulty.Easy;
				case 'medium':
					return Difficulty.Medium;
				case 'hard':
					return Difficulty.Hard;
				case 'custom':
					return Difficulty.Custom;
			}
		}
		else return state;
	},

	get_display(display_name) {
		switch(display_name) {
			case 'rows':
				return Difficulty.board_size(this.state_value('difficulty'))[0] ?? this.state_value('board-rows');
			case 'cols':
				return Difficulty.board_size(this.state_value('difficulty'))[1] ?? this.state_value('board-cols');
			case 'mines':
				return Difficulty.mine_count(this.state_value('difficulty')) ?? this.state_value('board-mines');
		}
	},

	update() {
		for(let name in this.display) {
			const value = this.get_display(name);
			this.display[name].innerText = value?.toString() ?? 'N/A';
		}
	},

	load_state() {
		let options = {
			difficulty: null,
			rows: null,
			cols: null,
			mine_count: null
		};

		for(let name in this.state) {
			const difficulty = options.difficulty ?? this.state_value('difficulty');

			switch(name) {
				case 'difficulty':
					options.difficulty = difficulty;
					break;

				case 'board-rows':
					options.rows = Difficulty.board_size(difficulty)[0] ?? this.state_value('board-rows');
					break;

				case 'board-cols':
					options.cols = Difficulty.board_size(difficulty)[1] ?? this.state_value('board-cols');
					break;

				case 'board-mines':
					options.mine_count = Difficulty.mine_count(difficulty) ?? this.state_value('board-mines');
					break;
			}
		}

		Game.reset(options);
	}
};


export default Options;
