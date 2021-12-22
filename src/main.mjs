import Options from "./options.mjs";
import { Game } from "./game/game.mjs";

function el(selector) {
	return document.querySelector(selector);
}


const canvas = el('#canvas');
const ctx = canvas.getContext('2d');

Game.init(canvas, ctx);
Options.init();
Options.load_state();

Game.render();


canvas.addEventListener('click', (ev) => {
	Game.update(ev);
	Game.render();
});

canvas.addEventListener('contextmenu', (ev) => {
	Game.update(ev);
	Game.render();

	ev.preventDefault();
	return false;
});


window.addEventListener('game:start', () => {
	console.log("Game started!");
});

window.addEventListener('game:lose', () => {
	console.log("Game lost!");
});

window.addEventListener('game:win', () => {
	console.log("Game won!");
});


el('#start').addEventListener('click', () => {
	Options.load_state();
	Game.render();
});

window.addEventListener('resize', () => {
	Game.resize_canvas();
	Game.render();
});
