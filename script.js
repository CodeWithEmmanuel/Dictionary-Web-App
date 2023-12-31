"use strict";

//DARK MODE
const parentEl = document.querySelector("html");
const modeSwitch = document.querySelector(".dark-mode-switch");
const toggleIcons = document.querySelectorAll(".mode-toggle");

function saveToStorage(name, obj) {
  const saveObj = JSON.stringify(obj);
  localStorage.setItem(name, saveObj);
}

let modeStatus = JSON.parse(localStorage.getItem("darkMode"));

if (modeStatus === null) {
  modeStatus = {
    darkMode: false,
  };
}

function loadDarkmode() {
  if (modeStatus.darkMode) {
    parentEl.classList.add("dark-mode");
    modeSwitch.classList.add("dark-mode-on");
  } else {
    parentEl.classList.remove("dark-mode");
    modeSwitch.classList.remove("dark-mode-on");
  }
}

function darkModeOn() {
  if (modeSwitch.classList.contains("dark-mode-on")) {
    parentEl.classList.add("dark-mode");
    modeStatus.darkMode = true;
  } else if (
    !modeSwitch.classList.contains("dark-mode-on") &&
    parentEl.classList.contains("dark-mode")
  ) {
    parentEl.classList.remove("dark-mode");
    modeStatus.darkMode = false;
  }

  saveToStorage("darkMode", modeStatus);
}

toggleIcons.forEach((toggleIcon) => {
  toggleIcon.addEventListener("click", () => {
    modeSwitch.classList.toggle("dark-mode-on");
    darkModeOn();
  });
});

//DICTIONARY
const apiUrl = "https://api.dictionaryapi.dev/api/v2/entries/en/";
const inputWord = document.querySelector("#search");
const searchBtn = document.querySelector("#search-btn");
const sourceEl = document.querySelector(".source");
const audioBtn = document.querySelector("#audio-btn");
let audioEl = "";
const wordGrammarEl = document.querySelector(".word-grammar");
const wordMeaningEl = document.querySelector(".word-meaning");
const definitionEl = document.querySelector(".definition");
const dictionaryEl = document.querySelector(".dictionary");
const notFoundEl = document.querySelector(".not-found");
const loaderEl = document.querySelector(".loader");

function clearFields() {
  definitionEl.classList.remove("error-message");
  dictionaryEl.classList.remove("empty-field");
  notFoundEl.classList.add("error-message");
  sourceEl.innerHTML = "";
  wordGrammarEl.innerHTML = "";
  wordMeaningEl.innerHTML = "";
}

const search = async function () {
  definitionEl.classList.add("error-message");
  loaderEl.classList.add("spin");
  try {
    const searchWord = inputWord.value.toLowerCase();
    if (searchWord.length === 0) throw new Error("Empty Field");
    const data = await fetch(`${apiUrl}${searchWord}`);
    if (!data.ok) throw new Error("Word not found");
    const wordData = await data.json();
    loaderEl.classList.remove("spin");
    clearFields();

    //PHONETICS
    const wordSpelling = wordData[0].word;
    const phoneticsArr = wordData[0].phonetics;
    const wordPhonetics = phoneticsArr[0].hasOwnProperty("text")
      ? wordData[0].phonetics[0].text
      : wordData[0].phonetics[1].text;
    const wordGrammarHtml = `
    <h1>${wordSpelling}</h1>
    <p>${wordPhonetics}</p>
    `;
    wordGrammarEl.insertAdjacentHTML("beforeend", wordGrammarHtml);

    //AUDIO
    audioBtn.classList.remove("hidden");
    const audioUrl = wordData[0].phonetics[0].audio;
    audioEl = new Audio(audioUrl);
    audioBtn.addEventListener("click", () => {
      audioEl.play();
    });

    //DEFINITIONS

    const wordMeanings = wordData[0].meanings;
    let definitionsHtml = wordMeanings
      .map((definition) => {
        const meaningList = definition.definitions
          .map((meaning) => {
            let example = meaning.hasOwnProperty("example")
              ? `<p class="meaning-example">"${meaning.example}"</p>`
              : "";
            return `<li>${meaning.definition}${example}</li>`;
          })
          .join("");
        return `
      <div class="meaning-item">
        <div class="meaning-head">
          <h2 class="part-of-speech">${definition.partOfSpeech}</h2>
          <span class="horizontal-line"></span>
        </div>
        <div class="meaning-content">
          <h3>Meaning</h3>
          <ul class="word-definitions">
          ${meaningList}
          </ul>
          <div class="word-synonyms">
          ${
            definition.hasOwnProperty("synonyms") &&
            definition.synonyms.length > 0
              ? `<h3>Synonyms</h3>
          <p>${definition.synonyms.join(", ")}</p>`
              : ""
          }
          </div>
        </div>
      </div>
    `;
      })
      .join("");

    wordMeaningEl.insertAdjacentHTML("beforeend", definitionsHtml);

    //SOURCE
    const meaningSource = wordData[0].sourceUrls[0];
    const sourceHtml = `<h3>Source</h3>
    <a
      href="${meaningSource}"
      class="source-link"
      target="_blank"
    >
      <p class="source-txt">${meaningSource}</p>
      <svg
        width="13"
        height="14"
        viewBox="0 0 13 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M6.09091 4.29545C6.50512 4.29545 6.84091 3.95967 6.84091 3.54545C6.84091 3.13124 6.50512 2.79545 6.09091 2.79545V4.29545ZM1.42603 3.97148L1.95635 4.50182L1.95637 4.50181L1.42603 3.97148ZM1.42603 12.574L1.95638 12.0437L1.95637 12.0436L1.42603 12.574ZM11.2045 7.90909C11.2045 7.49488 10.8688 7.15909 10.4545 7.15909C10.0403 7.15909 9.70455 7.49488 9.70455 7.90909H11.2045ZM4.83331 8.10603C4.54041 8.39893 4.54041 8.8738 4.83331 9.16669C5.1262 9.45959 5.60107 9.45959 5.89397 9.16669L4.83331 8.10603ZM13.1667 1.89397C13.4596 1.60107 13.4596 1.1262 13.1667 0.833306C12.8738 0.540413 12.3989 0.540413 12.106 0.833306L13.1667 1.89397ZM12.6364 2.11364C13.0506 2.11364 13.3864 1.77785 13.3864 1.36364C13.3864 0.949423 13.0506 0.613636 12.6364 0.613636V2.11364ZM9 0.613636C8.58579 0.613636 8.25 0.949423 8.25 1.36364C8.25 1.77785 8.58579 2.11364 9 2.11364V0.613636ZM13.3864 1.36364C13.3864 0.949423 13.0506 0.613636 12.6364 0.613636C12.2221 0.613636 11.8864 0.949423 11.8864 1.36364H13.3864ZM11.8864 5C11.8864 5.41421 12.2221 5.75 12.6364 5.75C13.0506 5.75 13.3864 5.41421 13.3864 5H11.8864ZM6.09091 2.79545H2.45455V4.29545H6.09091V2.79545ZM2.45455 2.79545C1.86987 2.79545 1.30913 3.02771 0.895692 3.44116L1.95637 4.50181C2.08849 4.36968 2.26769 4.29545 2.45455 4.29545V2.79545ZM0.895706 3.44115C0.482259 3.85458 0.25 4.41532 0.25 5H1.75C1.75 4.81314 1.82423 4.63394 1.95635 4.50182L0.895706 3.44115ZM0.25 5V11.5455H1.75V5H0.25ZM0.25 11.5455C0.25 12.1301 0.482269 12.6908 0.895685 13.1043L1.95637 12.0436C1.82422 11.9115 1.75 11.7323 1.75 11.5455H0.25ZM0.895678 13.1043C1.30913 13.5178 1.86988 13.75 2.45455 13.75V12.25C2.26768 12.25 2.08849 12.1758 1.95638 12.0437L0.895678 13.1043ZM2.45455 13.75H9V12.25H2.45455V13.75ZM9 13.75C9.58466 13.75 10.1454 13.5177 10.5588 13.1043L9.49818 12.0436C9.36603 12.1758 9.18683 12.25 9 12.25V13.75ZM10.5588 13.1043C10.9723 12.6908 11.2045 12.1301 11.2045 11.5455H9.70455C9.70455 11.7323 9.63033 11.9115 9.49818 12.0436L10.5588 13.1043ZM11.2045 11.5455V7.90909H9.70455V11.5455H11.2045ZM5.89397 9.16669L13.1667 1.89397L12.106 0.833306L4.83331 8.10603L5.89397 9.16669ZM12.6364 0.613636H9V2.11364H12.6364V0.613636ZM11.8864 1.36364V5H13.3864V1.36364H11.8864Z"
          fill="#757575"
        />
      </svg>
    </a>`;
    sourceEl.insertAdjacentHTML("beforeend", sourceHtml);

    localStorage.setItem("savedSearch", searchWord);
  } catch (error) {
    if (error.message === "Empty Field") {
      clearFields();
      definitionEl.classList.add("error-message");
      dictionaryEl.classList.add("empty-field");
    } else if (error.message === "Word not found") {
      clearFields();
      definitionEl.classList.add("error-message");
      notFoundEl.classList.remove("error-message");
    }
    loaderEl.classList.remove("spin");
    localStorage.removeItem("savedSearch");
  }
};

searchBtn.addEventListener("click", search);

document.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    search();
  }
});

//SELECT FONT
const selectFont = function (e) {
  const activeFont = e.target.value;

  if (activeFont === "serif") {
    dictionaryEl.classList.remove("sans");
    dictionaryEl.classList.remove("mono");
    dictionaryEl.classList.add("serif");
  } else if (activeFont === "mono") {
    dictionaryEl.classList.remove("sans");
    dictionaryEl.classList.remove("serif");
    dictionaryEl.classList.add("mono");
  } else {
    dictionaryEl.classList.remove("mono");
    dictionaryEl.classList.remove("serif");
    dictionaryEl.classList.add("sans");
  }

  localStorage.setItem("selectedFont", activeFont);
};
const fontInput = document.querySelector("#font-options");

fontInput.addEventListener("change", selectFont);

//RELOAD PAGE
document.addEventListener("DOMContentLoaded", () => {
  //RELOAD SELECTED THEME
  loadDarkmode();

  //RELOAD SELECTED FONT
  const savedFont = localStorage.getItem("selectedFont");
  if (savedFont) {
    fontInput.value = savedFont;
    fontInput.dispatchEvent(new Event("change"));
  }

  //RELOAD PREVIOUS SEARCH
  const savedSearch = localStorage.getItem("savedSearch");
  if (savedSearch) {
    inputWord.value = savedSearch;
    search();
  }
});

//CLEAR SEARCH
const homeBtn = document.querySelector(".app-logo");
const clearSearch = function () {
  inputWord.value = "";
  clearFields();
  localStorage.removeItem("savedSearch");
};

homeBtn.addEventListener("click", clearSearch);
