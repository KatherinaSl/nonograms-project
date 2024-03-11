export default class lastScoresStorage {
  constructor() {
    if (!localStorage.getItem("results")) {
      this.results = new Array();
    } else {
      this.results = JSON.parse(localStorage.getItem("results"));
    }
  }

  save(puzzle, elapsedTime) {
    this.results.push({
      time: elapsedTime,
      level: puzzle.level,
      name: puzzle.name,
    });

    if (this.results.length === 6) {
      this.results.shift();
    }

    localStorage.setItem("results", JSON.stringify(this.results));
  }

  getResults() {
    let copy = Object.assign([], this.results);

    copy.sort((a, b) => {
      return b.time - a.time;
    });
    return copy;
  }
}
