export default class Game {
  #progress;
  #puzzle;
  constructor() {}

  stringify() {
    return JSON.stringify({
      ["progress"]: this.#progress,
      ["puzzle"]: this.#puzzle,
    });
  }

  restoreFromJson(json) {
    let object = JSON.parse(json);
    this.#progress = object.progress;
    this.#puzzle = object.puzzle;
  }

  getPuzzleId() {
    return this.#puzzle.id;
  }

  start(puzzle) {
    this.#puzzle = puzzle;
    this.reset();
  }

  reset() {
    if (!this.#puzzle) {
      return;
    }

    this.#progress = new Array(this.#puzzle.solution.length);

    for (let i = 0; i < this.#puzzle.solution.length; i++) {
      this.#progress[i] = new Array(this.#puzzle.solution[0].length);
      this.#progress[i].fill("0");
    }
  }

  checkResult() {
    if (!this.#puzzle) {
      return false;
    }

    let result = true;
    for (let i = 0; i < this.#puzzle.solution.length; i++) {
      for (let j = 0; j < this.#puzzle.solution[i].length; j++) {
        if (
          isCellSelected(this.#progress[i][j]) !==
          isCellSelected(this.#puzzle.solution[i][j])
        ) {
          result = false;
        }
      }
    }
    return result;
  }

  resetCell(x, y) {
    this.#progress[y][x] = "0";
  }

  selectCell(x, y) {
    this.#progress[y][x] = "x";
  }

  crossCell(x, y) {
    this.#progress[y][x] = "y";
  }

  isCellSelected(x, y) {
    return this.#progress[y][x] === "x";
  }

  isCellCrossed(x, y) {
    return this.#progress[y][x] === "y";
  }
}

function isCellSelected(cell) {
  return cell === "x";
}
