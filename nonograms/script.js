import puzzles from "./puzzles.json" assert { type: "json" };

let startTime;
let stopwatchInterval;
let elapsedTime = 0;

let progress = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
];

let listOfPuzzles = {
  0: "Basic level (5x5)",
  1: "Middle level (10x10)",
  2: "Advanced level (15x15)",
};

function createElements() {
  const header = document.createElement("header");
  header.classList.add("header");

  const title = document.createElement("h1");
  title.classList.add("header__title");
  title.textContent = "Nonograms";

  header.append(title);

  const main = document.createElement("main");
  main.classList.add("main");

  const basicRules = document.createElement("div");
  basicRules.classList.add("main_game-rules");
  basicRules.textContent = "Basic rules";

  const paragraph = document.createElement("p");
  paragraph.textContent =
    "Numbers on the side (later clues, sometimes called number bars) represent\r\nhow many squares you need to color (i.e. colored squares, later boxes) in that line.\r\nBetween those boxes there must be at least one empty space (later cross).";
  basicRules.append(paragraph);

  const playground = document.createElement("div");
  playground.classList.add("main_playground-area");

  const subtitle = document.createElement("h2");
  subtitle.textContent = "Nonogram Puzzles";

  let ul = createListOfPuzzles();

  // pop up
  const popup = document.createElement("div");
  popup.classList.add("main_pop-up");
  popup.classList.add("hidden");

  const notification = document.createElement("div");
  notification.classList.add("main_pop-up__content");

  popup.append(notification);
  playground.append(subtitle, ul, popup);
  main.append(basicRules, playground);
  document.querySelector("body").append(header, main);
}

createElements();

function createListOfPuzzles() {
  const flex = document.createElement("div");
  flex.classList.add("main_flex-container");

  for (let i = 0; i < Object.keys(listOfPuzzles).length; i++) {
    let flexBox = document.createElement("div");
    let filteredPuzzles = puzzles.filter((puzzle) => puzzle.level === i + 1);
    let ul = document.createElement("ul");
    ul.textContent = listOfPuzzles[i];
    flexBox.classList.add("flex-box");
    flexBox.append(ul);

    for (let j = 0; j < filteredPuzzles.length; j++) {
      let li = document.createElement("li");

      li.textContent = "Puzzle " + (j + 1);
      li.id = filteredPuzzles[j].id;

      li.addEventListener("click", (event) => {
        const div = document.createElement("div");

        let currentPuzzles = document.querySelectorAll(".currentPuzzle");
        let table = createTable(filteredPuzzles[j]);

        let addition = document.createElement("div");
        let resetButton = createResetButton();
        let timer = createTimer();
        let saveButton = createSaveButton();

        div.classList.add("main_playground-box");
        div.append(addition, table);

        addition.classList.add("sidebar");
        addition.append(resetButton, timer, saveButton);

        event.target.classList.add("currentPuzzle");

        for (let puzzle of currentPuzzles) {
          puzzle.classList.remove("currentPuzzle");
        }

        if (document.querySelector("table")) {
          document.querySelector("table").remove();

          resetTimer();
          resetGame();
          document.querySelector("#resetButton").remove();
          document.querySelector("#saveButton").remove();
          document.querySelector("#stopwatch").remove();
        }

        document.querySelector(".main_playground-area").append(div);
      });

      ul.append(li);
    }

    flex.append(flexBox);
  }

  return flex;
}

function createTable(puzzle) {
  const table = document.createElement("table");
  let leftCluesWidth = puzzle.leftClues[0].length;
  let topCluesHeight = puzzle.topClues.length;

  let totalRowsNumber = puzzle.leftClues.length + puzzle.topClues.length;
  let totalColsNumber = puzzle.leftClues[0].length + puzzle.topClues[0].length;
  for (let i = 0; i < totalRowsNumber; i++) {
    const tr = table.insertRow();
    for (let j = 0; j < totalColsNumber; j++) {
      const td = tr.insertCell();

      //left clues
      if (i >= topCluesHeight && j >= 0 && j < leftCluesWidth) {
        let clue = puzzle.leftClues[i - topCluesHeight][j];
        if (clue !== 0) {
          td.appendChild(document.createTextNode(clue));
          td.classList.add("leftClueCell");
        }
      }

      //top clues
      if (i >= 0 && i < topCluesHeight && j >= leftCluesWidth) {
        let clue = puzzle.topClues[i][j - leftCluesWidth];
        if (clue !== 0) {
          td.appendChild(document.createTextNode(clue));
          td.classList.add("topClueCell");
        }
      }

      //playground
      if (i >= topCluesHeight && j >= leftCluesWidth) {
        td.classList.add("playgroundCell");
        td.addEventListener("click", () => {
          startTimer();
          td.classList.toggle("selectedCell");
          td.classList.remove("xCell");

          //   SOUND EFFECTS
          if (td.classList.contains("selectedCell")) {
            playSound("correct-choice");
          } else {
            playSound("whiteCell");
          }

          if (progress[i - topCluesHeight][j - leftCluesWidth]) {
            progress[i - topCluesHeight][j - leftCluesWidth] = false;
          } else {
            progress[i - topCluesHeight][j - leftCluesWidth] = true;
          }

          //   check results
          let result = checkResult(puzzle);
          if (result) {
            // console.log("secess");
            let sound = new Audio("./sounds/win.mp3");
            stopTimer();
            showPopup();
            sound.play();
          }
        });

        td.addEventListener("contextmenu", (event) => {
          startTimer();
          event.preventDefault();
          progress[i - topCluesHeight][j - leftCluesWidth] = false;
          td.classList.toggle("xCell");
          if (td.classList.contains("selectedCell")) {
            td.classList.remove("selectedCell");
          }

          //   SOUND EFFECTS
          if (td.classList.contains("xCell")) {
            playSound("xcell");
          } else {
            playSound("whiteCell");
          }

          let result = checkResult(puzzle);
          if (result) {
            stopTimer();
            showPopup();
          }
        });
      }
    }
  }
  return table;
}

function checkResult(puzzle) {
  let result = true;
  for (let i = 0; i < puzzle.solution.length; i++) {
    for (let j = 0; j < puzzle.solution[i].length; j++) {
      if (progress[i][j] != puzzle.solution[i][j]) {
        result = false;
      }
    }
  }
  return result;
}

function showPopup() {
  let popup = document.querySelector(".main_pop-up");
  popup.classList.remove("hidden");
  document.querySelector(".main_pop-up__content").innerHTML =
    "Great! You have solved the nonogram in " +
    formatTime(elapsedTime) +
    " seconds!";
}

document.addEventListener("click", (event) => {
  let popup = document.querySelector(".main_pop-up");
  if (
    !popup.classList.contains("hidden") &&
    event.target.closest(".main_pop-up__content") === null &&
    event.target.closest("table") === null
  ) {
    popup.classList.add("hidden");
  }
});

function createResetButton() {
  const resetButton = document.createElement("button");
  const div = document.createElement("div");
  resetButton.id = "resetButton";
  div.textContent = "Reset game";

  resetButton.addEventListener("click", () => {
    let cells = document.querySelectorAll(".playgroundCell");

    resetTimer();
    resetGame();

    for (let cell of cells) {
      if (
        cell.classList.contains("xCell") ||
        cell.classList.contains("selectedCell")
      ) {
        cell.classList.remove("xCell");
        cell.classList.remove("selectedCell");
      }
    }
  });

  resetButton.append(div);
  return resetButton;
}

function createSaveButton() {
  const saveButton = document.createElement("button");
  const div = document.createElement("div");
  saveButton.id = "saveButton";
  div.textContent = "Save game";
  saveButton.append(div);
  return saveButton;
}

function resetGame() {
  for (let i = 0; i < progress.length; i++) {
    progress[i].fill(false);
  }
}

// timer
function createTimer() {
  let paragraph = document.createElement("p");
  paragraph.textContent = "00:00";
  paragraph.id = "stopwatch";

  return paragraph;
}

function startTimer() {
  if (!stopwatchInterval) {
    startTime = new Date().getTime();
    stopwatchInterval = setInterval(updateStopwatch, 1000);
  }
}

function updateStopwatch() {
  let currentTime = new Date().getTime();
  let timeSpent = currentTime - startTime;
  document.getElementById("stopwatch").innerHTML = formatTime(timeSpent);
}

function pad(number) {
  return (number < 10 ? "0" : "") + number;
}

function stopTimer() {
  clearInterval(stopwatchInterval);
  elapsedTime = new Date().getTime() - startTime;
  stopwatchInterval = null;
}

function resetTimer() {
  document.getElementById("stopwatch").innerHTML = "00:00";
  stopTimer();
}

function formatTime(timePeriod) {
  let seconds = Math.floor(timePeriod / 1000) % 60;
  let minutes = Math.floor(timePeriod / 1000 / 60) % 60;
  let displayTime = pad(minutes) + ":" + pad(seconds);
  return displayTime;
}

function playSound(soundName) {
  let sound = new Audio("./sounds/" + soundName + ".mp3");
  sound.play();
}
