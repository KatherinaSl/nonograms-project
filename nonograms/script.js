import puzzles from "./puzzles.json" assert { type: "json" };
import Timer from "./timer.js";
import Game from "./game.js";

const timer = new Timer(
  (elapsedTime) =>
    (document.getElementById("stopwatch").innerHTML = formatTime(elapsedTime))
);

// const BORDER_STYLE = "5px solid black";

let game = new Game();

let listOfPuzzles = {
  0: "Basic level (5x5)",
  1: "Middle level (10x10)",
  2: "Advanced level (15x15)",
};

function createElements() {
  const header = createHTMLElement("header", "header");
  const switchButton = createHTMLElement("div", "switch");

  const input = createHTMLElement("input", "checkbox");
  input.type = "checkbox";
  input.id = "checkbox";

  const label = createHTMLElement("label", "checkbox-label");
  label.setAttribute("for", "checkbox");

  const moonImg = createHTMLElement("img", "moon");
  moonImg.src = "./assets/moon.png";
  const sunImg = createHTMLElement("img", "sun");
  sunImg.src = "./assets/sun.png";

  const span = createHTMLElement("span", "ball");
  label.append(sunImg, moonImg, span);
  switchButton.append(input, label);

  const title = createHTMLElement("h1", "header__title");
  title.textContent = "Nonograms";

  header.append(switchButton, title);

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

function createHTMLElement(tagName, className) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  return element;
}

createElements();

document.getElementById("checkbox").addEventListener("change", () => {
  document.body.classList.toggle("dark");
});

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

function listItemLeftClickHandler(event) {
  if (document.querySelector("table")) {
    timer.resetTimer();
    game.reset();
    resetCells();
    removePlayground();
  }

  let puzzle = getPuzzleById(event.target.id);
  game.start(puzzle);
  createPlayground(puzzle);
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
        let x = j - leftCluesWidth;
        let y = i - topCluesHeight;
        td.classList.add("playgroundCell");
        td.setAttribute("x", x);
        td.setAttribute("y", y);

        if (game.isCellSelected(x, y)) {
          td.classList.add("selectedCell");
        } else if (game.isCellCrossed(x, y)) {
          td.innerHTML = "X";
        }

        setBorders(td);
        td.addEventListener("click", playgroundLeftClickHandler);
        td.addEventListener("contextmenu", playgroundRightClickHandler);
      }
    }
  }
  return table;
}

function setBorders(td) {
  let y = td.getAttribute("y");
  let x = td.getAttribute("x");

  if (y == 0) {
    td.classList.add("borderTop");
  }
  if (y % 5 === 4) {
    td.classList.add("borderBottom");
  }
  if (x == 0) {
    td.classList.add("borderLeft");
  }
  if (x % 5 === 4) {
    td.classList.add("borderRight");
  }
}

function playgroundLeftClickHandler(event) {
  let td = event.target;
  let x = td.getAttribute("x");
  let y = td.getAttribute("y");

  timer.startTimer();
  td.innerHTML = "";

  if (game.isCellSelected(x, y)) {
    game.resetCell(x, y);
    td.classList.remove("selectedCell");
  } else {
    game.selectCell(x, y);
    td.classList.add("selectedCell");
  }

  if (td.classList.contains("selectedCell")) {
    playSound("correct-choice");
  } else {
    playSound("whiteCell");
  }

  validateWinning();
}

function playgroundRightClickHandler(event) {
  let td = event.target;
  let x = td.getAttribute("x");
  let y = td.getAttribute("y");

  timer.startTimer();
  event.preventDefault();

  if (game.isCellCrossed(x, y)) {
    game.resetCell(x, y);
    td.innerHTML = "";
  } else {
    game.crossCell(x, y);
    td.innerHTML = "X";
  }

  td.classList.remove("selectedCell");

  if (td.innerHTML === "X") {
    playSound("xcell");
  } else {
    playSound("whiteCell");
  }

  validateWinning();
}

function validateWinning() {
  let result = game.checkResult();
  if (result) {
    let sound = new Audio("./sounds/win.mp3");
    timer.stopTimer();
    showPopup();
    sound.play();
  }
}

function showPopup() {
  let popup = document.querySelector(".main_pop-up");
  let seconds = Math.floor(timer.elapsedTime / 1000);

  popup.classList.remove("hidden");
  document.querySelector(".main_pop-up__note").innerHTML =
    "Great! You have solved the nonogram in " + seconds + " seconds!";
}

function createPlayground(puzzle) {
  const div = createHTMLElement("div", "main_playground-box");
  const addition = createHTMLElement("div", "sidebar");
  const timerDiv = createHTMLElement("div", "timer");

  let resetButton = createResetButton();
  let saveButton = createSaveButton();
  let timerHTML = createTimer();
  let currentPuzzles = document.querySelectorAll(".currentPuzzle");

  let table = createTable(puzzle);

  addition.append(resetButton, saveButton);
  timerDiv.append(timerHTML);
  div.append(timerDiv, table, addition);

  for (let puzzle of currentPuzzles) {
    puzzle.classList.remove("currentPuzzle");
  }
  document.querySelector("#" + puzzle.id).classList.add("currentPuzzle");
  document.querySelector(".main_playground-area").append(div);
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

function resetCells() {
  let cells = document.querySelectorAll(".playgroundCell");
  for (let cell of cells) {
    cell.innerHTML = "";
    cell.classList.remove("selectedCell");
  }
}

function createResetButton() {
  const resetButton = document.createElement("button");
  const div = document.createElement("div");
  resetButton.id = "resetButton";
  div.textContent = "Reset game";

  resetButton.addEventListener("click", () => {
    timer.resetTimer();
    game.reset();
    resetCells();
  });

  resetButton.append(div);
  return resetButton;
}

function createSaveButton() {
  const saveButton = document.createElement("button");
  const div = document.createElement("div");
  saveButton.id = "saveButton";
  div.textContent = "Save game";

  div.addEventListener("click", () => {
    saveCurrentProgress();
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

function createTimer() {
  let paragraph = document.createElement("p");
  paragraph.textContent = "00:00";
  paragraph.id = "stopwatch";

  return paragraph;
}

function formatTime(timePeriod) {
  let seconds = Math.floor(timePeriod / 1000) % 60;
  let minutes = Math.floor(timePeriod / 1000 / 60) % 60;
  let displayTime = pad(minutes) + ":" + pad(seconds);
  return displayTime;
}

function pad(number) {
  return (number < 10 ? "0" : "") + number;
}

function saveCurrentProgress() {
  localStorage.setItem("game", game.stringify());
  localStorage.setItem("elapsedTime", timer.elapsedTime);
}

function getCurrentProgress() {
  game.restoreFromJson(localStorage.getItem("game"));
  timer.elapsedTime = Number(localStorage.getItem("elapsedTime"));
  timer.startTimer();

  if (document.querySelector("table")) {
    removePlayground();
  }
  let puzzle = getPuzzleById(game.getPuzzleId());
  createPlayground(puzzle);
}

function getPuzzleById(id) {
  return puzzles.filter((puzzle) => puzzle.id === id)[0];
}

function removePlayground() {
  document.querySelector("table").remove();
  document.querySelector("#resetButton").remove();
  document.querySelector("#saveButton").remove();
  document.querySelector("#stopwatch").remove();
  if (document.querySelectorAll(".main_playground-box").length !== 0) {
    document.querySelector(".main_playground-box").remove();
  }
}
