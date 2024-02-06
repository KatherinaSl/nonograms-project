let solution = [
  [true, true, true, true, false],
  [true, true, true, false, true],
  [true, true, false, false, true],
  [false, false, false, false, true],
  [false, true, true, true, true],
];

let leftClues = [
  [0, 4],
  [3, 1],
  [2, 1],
  [0, 1],
  [0, 4],
];

let topClues = [
  [0, 3, 2, 1, 0],
  [3, 1, 1, 1, 4],
];

let progress = [
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
  [false, false, false, false, false],
];

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
    "Numbers on the side (later clues, sometimes called number bars) \n represent how many squares you need to color (i.e. colored squares, later boxes) in that line. Between those boxes there must be at least one empty space (later cross).";
  basicRules.append(paragraph);

  const playground = document.createElement("div");
  playground.classList.add("playground-area");
  playground.textContent = "Nonogram Puzzle";

  let table = createTable();

  // pop up
  const popup = document.createElement("div");
  popup.classList.add("pop-up");
  popup.classList.add("hidden");

  const notification = document.createElement("div");
  notification.classList.add("pop-up__content");
  notification.textContent = "Great! You have solved the nonogram!";

  //   const message = document.createElement("p");
  //   message.classList.add("pop-up__message");
  //   message.textContent = "Great! You have solved the nonogram!";

  //   notification.append(message);
  popup.append(notification);

  main.append(basicRules, playground, table, popup);
  document.querySelector("body").append(header, main);
}

createElements();

function createTable() {
  const table = document.createElement("table");
  //   let leftCluesHeight = leftClues.length; //5
  let leftCluesWidth = leftClues[0].length; //2
  //   let topCluesWidth = topClues[0].length; //5
  let topCluesHeight = topClues.length; //2

  let totalRowsNumber = leftClues.length + topClues.length;
  let totalColsNumber = leftClues[0].length + topClues[0].length;
  for (let i = 0; i < totalRowsNumber; i++) {
    const tr = table.insertRow();
    for (let j = 0; j < totalColsNumber; j++) {
      const td = tr.insertCell();

      if (i >= 0 && i < topCluesHeight && j >= 0 && j < leftCluesWidth) {
        td.classList.add("cluesCell");
      }

      //left clues
      if (i >= topCluesHeight && j >= 0 && j < leftCluesWidth) {
        let clue = leftClues[i - topCluesHeight][j];
        td.classList.add("cluesCell");
        if (clue !== 0) {
          td.appendChild(document.createTextNode(clue));
          td.classList.add("leftClueCell");
        }
      }

      //top clues
      if (i >= 0 && i < topCluesHeight && j >= leftCluesWidth) {
        let clue = topClues[i][j - leftCluesWidth];
        td.classList.add("cluesCell");
        if (clue !== 0) {
          td.appendChild(document.createTextNode(clue));
          td.classList.add("topClueCell");
        }
      }

      //playground
      if (i >= topCluesHeight && j >= leftCluesWidth) {
        td.classList.add("playgroundCell");
        td.addEventListener("click", (event) => {
          td.classList.toggle("selectedCell");
          if (progress[i - topCluesHeight][j - leftCluesWidth]) {
            progress[i - topCluesHeight][j - leftCluesWidth] = false;
          } else {
            progress[i - topCluesHeight][j - leftCluesWidth] = true;
          }

          checkResult();
          showPopup();
        });
      }
    }
  }
  return table;
}

function checkResult() {
  let result = true;
  for (let i = 0; i < solution.length; i++) {
    for (let j = 0; j < solution[i].length; j++) {
      if (progress[i][j] != solution[i][j]) {
        result = false;
      }
    }
  }
  return result;
}

function showPopup() {
  let popup = document.querySelector(".pop-up");
  if (checkResult()) {
    popup.classList.remove("hidden");
  }
}

document.addEventListener("click", (event) => {
  let popup = document.querySelector(".pop-up");
  if (
    !popup.classList.contains("hidden") &&
    event.target.closest(".pop-up__content") === null &&
    event.target.closest("table") === null
  ) {
    popup.classList.add("hidden");
  }
});
