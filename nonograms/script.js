import puzzles from "./puzzles.json" assert { type: "json" };

let stopwatchInterval;
let currentPuzzleId;
let elapsedTime = 0;
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

  let continueButton = createContinueButton();

  const subtitle = document.createElement("h2");
  subtitle.textContent = "Nonogram Puzzles";

  let ul = createListOfPuzzles();

  // pop up
  const popup = document.createElement("div");
  popup.classList.add("main_pop-up");
  popup.classList.add("hidden");

  const notification = document.createElement("p");
  notification.classList.add("main_pop-up__note");

  const img = document.createElement("img");
  img.src = "./assets/totoro.gif";

  const content = document.createElement("div");
  content.classList.add("main_pop-up__content");
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

      li.addEventListener("click", (event) => {
        if (document.querySelector("table")) {
          resetTimer();
          resetGame();
          resetCells();

          document.querySelector("table").remove();
          document.querySelector("#resetButton").remove();
          document.querySelector("#saveButton").remove();
          document.querySelector("#stopwatch").remove();
        }

        const div = document.createElement("div");
        const addition = document.createElement("div");
        const timerDiv = document.createElement("div");

        let currentPuzzles = document.querySelectorAll(".currentPuzzle");
        let table = createTable(filteredPuzzles[j]);
        currentPuzzleId = filteredPuzzles[j].id;
        let resetButton = createResetButton();
        let saveButton = createSaveButton();
        let timer = createTimer();

        addition.classList.add("sidebar");
        addition.append(resetButton, saveButton);

        timerDiv.classList.add("timer");
        timerDiv.append(timer);

        div.classList.add("main_playground-box");
        div.append(timerDiv, table, addition);

        event.target.classList.add("currentPuzzle");

        for (let puzzle of currentPuzzles) {
          puzzle.classList.remove("currentPuzzle");
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

        if (progress[i - topCluesHeight][j - leftCluesWidth] === "x") {
          td.classList.add("selectedCell");
        } else if (progress[i - topCluesHeight][j - leftCluesWidth] === "y") {
          td.classList.add("xCell");
        }
        td.addEventListener("click", () => {
          startTimer();
          td.classList.remove("xCell");

          //   SOUND EFFECTS
          if (td.classList.contains("selectedCell")) {
            playSound("correct-choice");
          } else {
            playSound("whiteCell");
          }

          if (progress[i - topCluesHeight][j - leftCluesWidth] === "x") {
            progress[i - topCluesHeight][j - leftCluesWidth] = "0";
            td.classList.remove("selectedCell");
          } else {
            progress[i - topCluesHeight][j - leftCluesWidth] = "x";
            td.classList.add("selectedCell");
          }

          //   check results
          let result = checkResult(puzzle);
          if (result) {
            let sound = new Audio("./sounds/win.mp3");
            stopTimer();
            showPopup();
            sound.play();
          }
        });

        td.addEventListener("contextmenu", (event) => {
          startTimer();
          event.preventDefault();

          if (progress[i - topCluesHeight][j - leftCluesWidth] === "y") {
            progress[i - topCluesHeight][j - leftCluesWidth] = "0";
            td.classList.remove("xCell");
          } else {
            progress[i - topCluesHeight][j - leftCluesWidth] = "y";
            td.classList.add("xCell");
          }

          td.classList.remove("selectedCell");

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
  let seconds = Math.floor(elapsedTime / 1000);

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
    resetTimer();
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

function startTimer() {
  if (!stopwatchInterval) {
    stopwatchInterval = setInterval(updateStopwatch, 1000);
  }
}

function updateStopwatch() {
  elapsedTime += 1000;
  document.getElementById("stopwatch").innerHTML = formatTime(elapsedTime);
}

function pad(number) {
  return (number < 10 ? "0" : "") + number;
}

function stopTimer() {
  clearInterval(stopwatchInterval);
  stopwatchInterval = null;
}

function resetTimer() {
  elapsedTime = 0;
  document.getElementById("stopwatch").innerHTML = "00:00";
  stopTimer();
}

function formatTime(timePeriod) {
  let seconds = Math.floor(timePeriod / 1000) % 60;
  let minutes = Math.floor(timePeriod / 1000 / 60) % 60;
  let displayTime = pad(minutes) + ":" + pad(seconds);
  return displayTime;
}

function saveCurrentProgress(gameProgress) {
  localStorage.setItem("progress", JSON.stringify(gameProgress));
  localStorage.setItem("elapsedTime", elapsedTime);
  localStorage.setItem("currentPuzzleId", currentPuzzleId);
}

function getCurrentProgress() {
  progress = JSON.parse(localStorage.getItem("progress"));
  currentPuzzleId = localStorage.getItem("currentPuzzleId");

  elapsedTime = Number(localStorage.getItem("elapsedTime"));
  startTimer();

  // CREATE NEW PUZZLE
  if (document.querySelector("table")) {
    document.querySelector("table").remove();
    document.querySelector("#resetButton").remove();
    document.querySelector("#saveButton").remove();
    document.querySelector("#stopwatch").remove();
  }

  const div = document.createElement("div");
  const addition = document.createElement("div");
  const timerDiv = document.createElement("div");

  let resetButton = createResetButton();
  let saveButton = createSaveButton();
  let timer = createTimer();

  let filteredPuzzle = puzzles.filter(
    (puzzle) => puzzle.id === currentPuzzleId
  );
  console.log("current puzzle id: " + currentPuzzleId);
  console.log("current puzzle: " + filteredPuzzle[0]);
  let table = createTable(filteredPuzzle[0]);

  addition.classList.add("sidebar");
  addition.append(resetButton, saveButton);

  timerDiv.classList.add("timer");
  timerDiv.append(timer);

  div.classList.add("main_playground-box");
  div.append(timerDiv, table, addition);

  let currentPuzzles = document.querySelectorAll(".currentPuzzle");
  for (let puzzle of currentPuzzles) {
    puzzle.classList.remove("currentPuzzle");
  }

  document.querySelector("#" + currentPuzzleId).classList.add("currentPuzzle");
  document.querySelector(".main_playground-area").append(div);
}

function resetCells() {
  let cells = document.querySelectorAll(".playgroundCell");
  for (let cell of cells) {
    cell.classList.remove("xCell");
    cell.classList.remove("selectedCell");
  }
}
