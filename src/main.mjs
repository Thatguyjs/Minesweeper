import Options from "./options.mjs";
import Timer from "./timer.mjs";
import { Game } from "./game/game.mjs";

function el(selector) {
	return document.querySelector(selector);
}


const canvas = el('#canvas');
const ctx = canvas.getContext('2d');

const timer = new Timer(el('#timer'));

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
	timer.start();
});

window.addEventListener('game:lose', () => {
	console.log("Game lost!");
	timer.stop();
});

window.addEventListener('game:win', () => {
	console.log("Game won!");
	timer.stop();
});


el('#start').addEventListener('click', () => {
	Options.load_state();
	Game.render();
});

window.addEventListener('resize', () => {
	Game.resize_canvas();
	Game.render();
});
