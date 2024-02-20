export default class Timer {
  #stopwatchInterval;
  constructor(updateCallback) {
    this.elapsedTime = 0;
    this.updateCallback = updateCallback;
  }

  startTimer() {
    if (!this.#stopwatchInterval) {
      this.#stopwatchInterval = setInterval(updateStopwatch, 1000, this);
    }
  }

  stopTimer() {
    clearInterval(this.#stopwatchInterval);
    this.#stopwatchInterval = null;
  }

  resetTimer() {
    this.elapsedTime = 0;
    this.stopTimer();
    this.updateCallback(this.elapsedTime);
  }
}

function updateStopwatch(timer) {
  timer.elapsedTime += 1000;
  timer.updateCallback(timer.elapsedTime);
}
