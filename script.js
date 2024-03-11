import puzzles from "./puzzles.json" assert { type: "json" };
import Timer from "./timer.js";
import Game from "./game.js";
import LastScoresStorage from "./lastScoresStorage.js";

const timer = new Timer((elapsedTime) => {
  if (document.getElementById("stopwatch")) {
    document.getElementById("stopwatch").innerHTML = formatTime(elapsedTime);
  }
});

const lastScoresStorage = new LastScoresStorage();

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
    "Numbers on the side (later clues, sometimes called number bars) represent how many squares you need to color (i.e. colored squares, later boxes) in that line. Between those boxes there must be at least one empty space (later cross).";

  basicRules.append(paragraph);

  const playground = createHTMLElement("div", "main_playground-area");

  const subtitle = document.createElement("h2");
  subtitle.textContent = "Nonogram Puzzles";

  // MENU
  const menu = createHTMLElement("div", "main_menu");
  // let flexContainer = createListOfPuzzles();
  // flexContainer.style.visibility = "hidden";
  const buttonArea = createHTMLElement("div", "buttonArea");
  let continueButton = createContinueButton();
  let randomButton = createRadomButton();
  let puzzlesButton = createListOfPuzzlesButton();
  buttonArea.append(continueButton, randomButton, puzzlesButton);

  const table = createScoreTable();

  menu.append(buttonArea, table);
  // menu.classList.add("hidden");

  // menu.append(continueButton, randomButton, puzzlesButton);

  // pop up
  const popup = createHTMLElement("div", "main_pop-up");
  popup.classList.add("hidden");

  const notification = createHTMLElement("p", "main_pop-up__note");

  const img = document.createElement("img");
  img.src = "./assets/totoro.gif";

  const content = createHTMLElement("div", "main_pop-up__content");
  content.append(img, notification);

  popup.append(content);
  playground.append(subtitle, menu, popup);
  main.append(basicRules, playground);

  const footer = createHTMLElement("footer", "footer");
  const backToMenu = createHTMLElement("p", "paragraph");
  backToMenu.textContent = "Back to menu";
  footer.append(backToMenu);

  document.querySelector("body").append(header, main, footer);
}

function createHTMLElement(tagName, className) {
  const element = document.createElement(tagName);
  element.classList.add(className);
  return element;
}

createElements();

function checkMode() {
  let lightMode = localStorage.getItem("lightMode");
  console.log("lightMode is " + lightMode);
  if (lightMode === "false") {
    document.body.classList.toggle("dark");
    document.getElementById("checkbox").checked = true;
  }
}

checkMode();

function createListOfPuzzlesButton() {
  const puzzlesButton = document.createElement("button");
  const div = document.createElement("div");
  puzzlesButton.id = "puzzlesButton";
  div.textContent = "Choose puzzle";

  div.addEventListener("click", () => {
    let flex = createListOfPuzzles();
    document.querySelector(".buttonArea").remove();
    document.querySelector(".main_menu").append(flex);
    document.querySelector(".scoreTable").remove();
  });

  puzzlesButton.append(div);
  return puzzlesButton;
}

function createRadomButton() {
  const radomButton = document.createElement("button");
  const div = document.createElement("div");
  radomButton.id = "radomButton";
  div.textContent = "Random puzzle";

  div.addEventListener("click", () => {
    let puzzle = getRandomPuzzle();
    // console.log(puzzle);
    document.querySelector(".buttonArea").remove();
    document.querySelector(".scoreTable").remove();
    game.start(puzzle);
    createPlayground(puzzle);
  });

  radomButton.append(div);
  return radomButton;
}

function getRandomPuzzle() {
  return puzzles[Math.round(Math.random() * puzzles.length)];
}

document.getElementById("checkbox").addEventListener("change", (event) => {
  document.body.classList.toggle("dark");
  console.log("event target " + !event.target.checked);
  localStorage.setItem("lightMode", !event.target.checked);
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

      li.textContent = filteredPuzzles[j].name;
      li.id = filteredPuzzles[j].id;

      li.addEventListener("click", listItemLeftClickHandler);
      ul.append(li);
    }

    flex.append(flexBox);
  }

  return flex;
}

function listItemLeftClickHandler(event) {
  timer.resetTimer();
  game.reset();
  if (document.querySelector(".puzzleTable")) {
    // timer.resetTimer();
    // game.reset();
    resetCells();
    removePlayground();
  }

  let puzzle = getPuzzleById(event.target.id);
  game.start(puzzle);
  createPlayground(puzzle);
  document.querySelector("#" + puzzle.id).classList.add("currentPuzzle");
}

function createTable(puzzle) {
  const table = createHTMLElement("table", "puzzleTable");
  let caption = document.createElement("caption");

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

  caption.textContent = "" + puzzle.name;

  table.append(caption);
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
    let puzzle = getPuzzleById(game.getPuzzleId());
    lastScoresStorage.save(puzzle, timer.elapsedTime);
  }
}

function showPopup() {
  let popup = document.querySelector(".main_pop-up");
  let seconds = Math.floor(timer.elapsedTime / 1000);

  popup.classList.remove("hidden");
  document.querySelector("body").classList.add("fixed-position");
  document.querySelector(".main_pop-up__note").innerHTML =
    "Great! You have solved the nonogram in " + seconds + " seconds!";
}

function createPlayground(puzzle) {
  const div = createHTMLElement("div", "main_playground-box");
  const addition = createHTMLElement("div", "sidebar");
  const timerDiv = createHTMLElement("div", "timer");

  let resetButton = createResetButton();
  let saveButton = createSaveButton();
  let solutionButton = createSolutionButton();
  let timerHTML = createTimer();
  let currentPuzzles = document.querySelectorAll(".currentPuzzle");

  let table = createTable(puzzle);

  addition.append(resetButton, saveButton, solutionButton);
  timerDiv.append(timerHTML);
  div.append(timerDiv, table, addition);

  for (let puzzle of currentPuzzles) {
    puzzle.classList.remove("currentPuzzle");
  }

  // currentPuzzleId = localStorage.getItem("currentPuzzleId");
  // document.querySelector("#" + currentPuzzleId).classList.add("currentPuzzle");

  // document.querySelector("#" + puzzle.id).classList.add("currentPuzzle");
  document.querySelector(".main_playground-area").append(div);
}

document.addEventListener("click", (event) => {
  let popup = document.querySelector(".main_pop-up");
  if (
    !popup.classList.contains("hidden") &&
    event.target.closest(".main_pop-up__content") === null &&
    event.target.closest(".puzzleTable") === null
  ) {
    popup.classList.add("hidden");
    document.querySelector("body").classList.remove("fixed-position");
  }
});

document.addEventListener("click", (event) => {});

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

    document.querySelector("#saveButton").removeAttribute("disabled");
    document.querySelector("#saveButton").style.backgroundColor =
      "rgb(217, 199, 0)";
    document.querySelector("#saveButton").style.color = "rgb(0, 0, 0)";
  });

  resetButton.append(div);
  return resetButton;
}

function createSaveButton() {
  const saveButton = document.createElement("button");
  saveButton.removeAttribute("disabled");
  const div = document.createElement("div");
  saveButton.id = "saveButton";
  div.textContent = "Save game";

  div.addEventListener("click", () => {
    saveCurrentProgress();
  });

  saveButton.append(div);
  return saveButton;
}

function createSolutionButton() {
  const solutionButton = document.createElement("button");
  const div = document.createElement("div");
  solutionButton.id = "solutionButton";
  div.textContent = "Solution";

  div.addEventListener("click", () => {
    game.solve();
    // document.querySelector("#saveButton").disable;
    timer.resetTimer();
    if (document.querySelector(".puzzleTable")) {
      removePlayground();
    }

    let puzzle = getPuzzleById(game.getPuzzleId());
    createPlayground(puzzle);
    // document.querySelector("#" + puzzle.id).classList.add("currentPuzzle");
    document.querySelector("#saveButton").setAttribute("disabled", true);
    document.querySelector("#saveButton").style.backgroundColor =
      "rgb(241, 241, 241, 0.6)";
    document.querySelector("#saveButton").style.color = "rgb(241, 241, 241)";
  });

  solutionButton.append(div);
  return solutionButton;
}

function createContinueButton() {
  const saveButton = document.createElement("button");
  const div = document.createElement("div");
  saveButton.id = "continueButton";
  div.textContent = "Continue last game";

  div.addEventListener("click", () => {
    getCurrentProgress();
    document.querySelector(".buttonArea").remove();
    document.querySelector(".scoreTable").remove();
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
  // currentPuzzleId = localStorage.getItem("currentPuzzleId");

  let puzzle = getPuzzleById(game.getPuzzleId());
  createPlayground(puzzle);
  // document.querySelector("#" + currentPuzzleId).classList.add("currentPuzzle");

  timer.elapsedTime = Number(localStorage.getItem("elapsedTime"));
  timer.startTimer();

  // if (document.querySelector("table")) {
  //   removePlayground();
  // }
}

function getPuzzleById(id) {
  return puzzles.filter((puzzle) => puzzle.id === id)[0];
}

function removePlayground() {
  document.querySelector(".puzzleTable").remove();
  document.querySelector("#resetButton").remove();
  document.querySelector("#saveButton").remove();
  document.querySelector("#stopwatch").remove();
  if (document.querySelectorAll(".main_playground-box").length !== 0) {
    document.querySelector(".main_playground-box").remove();
  }
}

document.querySelector(".paragraph").addEventListener("click", () => {
  if (document.querySelector(".main_flex-container")) {
    document.querySelector(".main_flex-container").remove();
  }
  if (document.querySelector(".main_playground-box")) {
    document.querySelector(".main_playground-box").remove();
  }

  if (document.querySelector(".scoreTable")) {
    document.querySelector(".scoreTable").remove;
  }

  if (
    !document.querySelector(".buttonArea") &&
    !document.querySelector(".scoreTable")
  ) {
    const buttonArea = createHTMLElement("div", "buttonArea");
    let continueButton = createContinueButton();
    let randomButton = createRadomButton();
    let puzzlesButton = createListOfPuzzlesButton();
    let table = createScoreTable();
    buttonArea.append(continueButton, randomButton, puzzlesButton);
    document.querySelector(".main_menu").append(buttonArea, table);
  }
});

function createScoreTable() {
  const table = createHTMLElement("table", "scoreTable");
  let results = lastScoresStorage.getResults();
  const caption = document.createElement("caption");
  caption.textContent = "Score Table";

  const rowNumbs = results.length;
  let frontRow = document.createElement("tr");
  let titleTime = document.createElement("td");
  titleTime.textContent = "Time";
  let titleLevel = document.createElement("td");
  titleLevel.textContent = "Level";
  let titleName = document.createElement("td");
  titleName.textContent = "Name";
  frontRow.append(titleTime, titleLevel, titleName);
  table.append(caption, frontRow);

  for (let i = 0; i < rowNumbs; i++) {
    const tr = table.insertRow();
    let tdTime = document.createElement("td");
    tdTime.textContent = formatTime(results[i].time);
    let tdLevel = document.createElement("td");
    tdLevel.textContent = results[i].level;
    let tdName = document.createElement("td");
    tdName.textContent = results[i].name;

    tr.append(tdTime, tdLevel, tdName);
  }

  return table;
}
