import { Game, Difficulty } from "./game/game.mjs";

function el(selector) {
	return document.querySelector(selector);
}


const canvas = el('#canvas');
const ctx = canvas.getContext('2d');

Game.init(canvas, ctx);
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

window.addEventListener('resize', () => {
	Game.resize_canvas();
	Game.render();
});
