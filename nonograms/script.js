import puzzles from "./puzzles.json" assert { type: "json" };
import Timer from "./timer.js";

const timer = new Timer(
  (elapsedTime) =>
    (document.getElementById("stopwatch").innerHTML = formatTime(elapsedTime))
);

let currentPuzzleId;
let progress = [
  ["0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
  ["0", "0", "0", "0", "0"],
];

let listOfPuzzles = {
  0: "Basic level (5x5)",
  1: "Middle level (10x10)",
  2: "Advanced level (15x15)",
};

function createElements() {
  const header = createHTMLElement("header", "header");
  const title = createHTMLElement("h1", "header__title");
  title.textContent = "Nonograms";

  header.append(title);

  const main = createHTMLElement("main", "main");
  const basicRules = createHTMLElement("div", "main_game-rules");
  basicRules.textContent = "Basic rules";

  const paragraph = document.createElement("p");
  paragraph.textContent =
    "Numbers on the side (later clues, sometimes called number bars) represent\r\nhow many squares you need to color (i.e. colored squares, later boxes) in that line.\r\nBetween those boxes there must be at least one empty space (later cross).";
  basicRules.append(paragraph);

  const playground = createHTMLElement("div", "main_playground-area");

  let continueButton = createContinueButton();

  const subtitle = document.createElement("h2");
  subtitle.textContent = "Nonogram Puzzles";

  let ul = createListOfPuzzles();

  // pop up
  const popup = createHTMLElement("div", "main_pop-up");
  popup.classList.add("hidden");

  const notification = createHTMLElement("p", "main_pop-up__note");

  const img = document.createElement("img");
  img.src = "./assets/totoro.gif";

  const content = createHTMLElement("div", "main_pop-up__content");
  content.append(img, notification);

  popup.append(content);
  playground.append(subtitle, ul, popup);
  main.append(basicRules, continueButton, playground);
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

      li.addEventListener("click", listItemLeftClickHandler);
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
        td.setAttribute("x", j - leftCluesWidth);
        td.setAttribute("y", i - topCluesHeight);

        if (progress[i - topCluesHeight][j - leftCluesWidth] === "x") {
          td.classList.add("selectedCell");
        } else if (progress[i - topCluesHeight][j - leftCluesWidth] === "y") {
          td.classList.add("xCell");
        }
        td.addEventListener("click", playgroundLeftClickHandler);
        td.addEventListener("contextmenu", playgroundRightClickHandler);
      }
    }
  }
  return table;
}

function checkResult(puzzle) {
  let result = true;
  for (let i = 0; i < puzzle.solution.length; i++) {
    for (let j = 0; j < puzzle.solution[i].length; j++) {
      if (
        isCellSelected(progress[i][j]) !== isCellSelected(puzzle.solution[i][j])
      ) {
        result = false;
      }
    }
  }
  return result;
}

function showPopup() {
  let popup = document.querySelector(".main_pop-up");
  let seconds = Math.floor(timer.elapsedTime / 1000);

  popup.classList.remove("hidden");
  document.querySelector(".main_pop-up__note").innerHTML =
    "Great! You have solved the nonogram in " + seconds + " seconds!";
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
    timer.resetTimer();
    resetGame();
    resetCells();
  });

  resetButton.append(div);
  return resetButton;
}

function resetGame() {
  for (let i = 0; i < progress.length; i++) {
    progress[i].fill("0");
  }
}

function createSaveButton() {
  const saveButton = document.createElement("button");
  const div = document.createElement("div");
  saveButton.id = "saveButton";
  div.textContent = "Save game";

  div.addEventListener("click", () => {
    saveCurrentProgress(progress);
  });

  saveButton.append(div);
  return saveButton;
}

function createContinueButton() {
  const saveButton = document.createElement("button");
  const div = document.createElement("div");
  saveButton.id = "continueButton";
  div.textContent = "Continue last game";

  div.addEventListener("click", () => {
    getCurrentProgress();
  });

  saveButton.append(div);
  return saveButton;
}

function playSound(soundName) {
  let sound = new Audio("./sounds/" + soundName + ".mp3");
  sound.play();
}

function isCellSelected(cell) {
  return cell === "x";
}

// timer
function createTimer() {
  let paragraph = document.createElement("p");
  paragraph.textContent = "00:00";
  paragraph.id = "stopwatch";

  return paragraph;
}

function pad(number) {
  return (number < 10 ? "0" : "") + number;
}

function formatTime(timePeriod) {
  let seconds = Math.floor(timePeriod / 1000) % 60;
  let minutes = Math.floor(timePeriod / 1000 / 60) % 60;
  let displayTime = pad(minutes) + ":" + pad(seconds);
  return displayTime;
}

function saveCurrentProgress(gameProgress) {
  localStorage.setItem("progress", JSON.stringify(gameProgress));
  localStorage.setItem("elapsedTime", timer.elapsedTime);
  localStorage.setItem("currentPuzzleId", currentPuzzleId);
}

function getCurrentProgress() {
  progress = JSON.parse(localStorage.getItem("progress"));
  currentPuzzleId = localStorage.getItem("currentPuzzleId");

  timer.elapsedTime = Number(localStorage.getItem("elapsedTime"));
  timer.startTimer();

  if (document.querySelector("table")) {
    removePlayground();
  }
  createPlayground(currentPuzzleId);
}

function resetCells() {
  let cells = document.querySelectorAll(".playgroundCell");
  for (let cell of cells) {
    cell.classList.remove("xCell");
    cell.classList.remove("selectedCell");
  }
}

function playgroundLeftClickHandler(event) {
  let td = event.target;
  let x = td.getAttribute("x");
  let y = td.getAttribute("y");

  timer.startTimer();
  td.classList.remove("xCell");

  if (progress[y][x] === "x") {
    progress[y][x] = "0";
    td.classList.remove("selectedCell");
  } else {
    progress[y][x] = "x";
    td.classList.add("selectedCell");
  }

  if (td.classList.contains("selectedCell")) {
    playSound("correct-choice");
  } else {
    playSound("whiteCell");
  }

  validateWinning();
}

function getPuzzleById(id) {
  return puzzles.filter((puzzle) => puzzle.id === id)[0];
}

function playgroundRightClickHandler(event) {
  let td = event.target;
  let x = td.getAttribute("x");
  let y = td.getAttribute("y");

  timer.startTimer();
  event.preventDefault();

  if (progress[y][x] === "y") {
    progress[y][x] = "0";
    td.classList.remove("xCell");
  } else {
    progress[y][x] = "y";
    td.classList.add("xCell");
  }

  td.classList.remove("selectedCell");

  if (td.classList.contains("xCell")) {
    playSound("xcell");
  } else {
    playSound("whiteCell");
  }

  validateWinning();
}

function validateWinning() {
  let puzzle = getPuzzleById(currentPuzzleId);
  let result = checkResult(puzzle);
  if (result) {
    let sound = new Audio("./sounds/win.mp3");
    timer.stopTimer();
    showPopup();
    sound.play();
  }
}

function listItemLeftClickHandler(event) {
  if (document.querySelector("table")) {
    timer.resetTimer();
    resetGame();
    resetCells();
    removePlayground();
  }
  currentPuzzleId = event.target.id;
  createPlayground(currentPuzzleId);
}

function createHTMLElement(tagName, className) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  return element;
}

function removePlayground() {
  document.querySelector("table").remove();
  document.querySelector("#resetButton").remove();
  document.querySelector("#saveButton").remove();
  document.querySelector("#stopwatch").remove();
}

function createPlayground(puzzleId) {
  const div = createHTMLElement("div", "main_playground-box");
  const addition = createHTMLElement("div", "sidebar");
  const timerDiv = createHTMLElement("div", "timer");

  let resetButton = createResetButton();
  let saveButton = createSaveButton();
  let timerHTML = createTimer();
  let currentPuzzles = document.querySelectorAll(".currentPuzzle");

  let filteredPuzzle = getPuzzleById(puzzleId);
  let table = createTable(filteredPuzzle);

  addition.append(resetButton, saveButton);
  timerDiv.append(timerHTML);
  div.append(timerDiv, table, addition);

  for (let puzzle of currentPuzzles) {
    puzzle.classList.remove("currentPuzzle");
  }
  document.querySelector("#" + currentPuzzleId).classList.add("currentPuzzle");
  document.querySelector(".main_playground-area").append(div);
}
