import Options from "./options.mjs";
import Timer from "./timer.mjs";
import { Game } from "./game/game.mjs";

function el(selector) {
	return document.querySelector(selector);
}


const canvas = el('#canvas');
const ctx = canvas.getContext('2d');

const timer = new Timer(el('#timer'));
timer.reset();

Game.init(canvas, ctx);
Options.init();
Options.load_state();

Game.render();


canvas.addEventListener('click', (ev) => {
	Game.update(ev);
	Game.render();

	ev.preventDefault();
	return false;
});

canvas.addEventListener('contextmenu', (ev) => {
	Game.update(ev);
	Game.render();

	ev.preventDefault();
	return false;
});


window.addEventListener('game:start', () => {
	timer.start();
});

window.addEventListener('game:lose', () => {
	timer.stop();
	Options.update();
});

window.addEventListener('game:win', () => {
	timer.stop();
	Options.update();
});


el('#start').addEventListener('click', () => {
	Options.load_state();
	Options.update();

	timer.reset();
	Game.render();
});

window.addEventListener('resize', () => {
	Game.resize_canvas();
	Game.render();
});
