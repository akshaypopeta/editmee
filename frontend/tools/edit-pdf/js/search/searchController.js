/* ==========================================================
   EDITMEE
   FILE : search/searchController.js

   PURPOSE
   Controls the Search feature.

   Responsibilities

   • Search UI
   • Keyboard shortcuts
   • Execute search
   • Navigate results

==========================================================*/

import SearchUI from "./searchUI.js";

export default class SearchController {

    constructor(renderer) {

        this.renderer = renderer;

        this.results = [];

        this.currentIndex = -1;

        this.searchUI = new SearchUI();

        this.initialize();

    }

    initialize() {

    this.initializeKeyboardShortcuts();

    this.initializeEvents();

}

initializeEvents() {

    this.searchUI.input.addEventListener("keydown", async (event) => {

        if (event.key !== "Enter") {
            return;
        }

        const query = this.searchUI.input.value.trim();

        if (!query) {
            return;
        }

        this.results = await this.renderer.search(query);

       this.currentIndex = this.results.length ? 0 : -1;

this.updateSearchCount();

if (this.results.length) {

    await this.goToCurrentResult();

}

console.log(this.results);

    });

this.searchUI.nextButton.addEventListener("click", async () => {

    if (!this.results.length) {
        return;
    }

    this.currentIndex++;

    if (this.currentIndex >= this.results.length) {

        this.currentIndex = 0;

    }

    this.updateSearchCount();

    await this.goToCurrentResult();

});

this.searchUI.prevButton.addEventListener("click", async () => {

    if (!this.results.length) {
        return;
    }

    this.currentIndex--;

    if (this.currentIndex < 0) {

        this.currentIndex = this.results.length - 1;

    }

    this.updateSearchCount();

    await this.goToCurrentResult();

});

}

updateSearchCount() {

    if (!this.results.length) {

        this.searchUI.count.textContent = "0 / 0";

        return;

    }

    this.searchUI.count.textContent =
        `${this.currentIndex + 1} / ${this.results.length}`;

}

async goToCurrentResult() {

    if (this.currentIndex < 0) {
        return;
    }

    const result = this.results[this.currentIndex];

    await this.renderer.renderPage(result.pageNumber);

}

    initializeKeyboardShortcuts() {

        document.addEventListener("keydown", (event) => {

            if (event.ctrlKey && event.key.toLowerCase() === "f") {

                event.preventDefault();

                this.searchUI.show();

            }

        });

    }

}