class Timer {
	#elements = {
		minute: null,
		second: null,
		millis: null
	};

	#start = 0;
	#paused = false;
	#interval = null;


	constructor(container) {
		this.#elements.minute = container.querySelector('*[name="timer:minute"]');
		this.#elements.second = container.querySelector('*[name="timer:second"]');
		this.#elements.millis = container.querySelector('*[name="timer:millis"]');
	}

	reset() {
		this.stop();
		this.#update(true);
	}

	start() {
		this.#start = Date.now();

		let interval = 0;
		if(this.#elements.millis) interval = 1;
		else if(this.#elements.second) interval = 1000;
		else if(this.#elements.minute) interval = 60000;

		this.#update();
		this.#interval = setInterval(this.#update.bind(this), interval);
	}

	pause() { this.#paused = true; }
	resume() { this.#paused = false; }

	stop() {
		clearInterval(this.#interval);
		this.#update();
	}

	#update(reset=false) {
		if(this.#paused) return;
		const elapsed = reset ? 0 : Date.now() - this.#start;

		if(this.#elements.millis) this.#elements.millis.innerText = (elapsed % 1000).toString().slice(0, 2).padStart(2, '0');
		if(this.#elements.second) this.#elements.second.innerText = (Math.floor(elapsed / 1000) % 60).toString().padStart(2, '0');
		if(this.#elements.minute) this.#elements.minute.innerText = (Math.floor(elapsed / 60000) % 60).toString().padStart(2, '0');
	}
}


export default Timer;
