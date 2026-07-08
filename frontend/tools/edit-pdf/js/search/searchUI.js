/* ==========================================================
   EDITMEE
   FILE : search/searchUI.js

   PURPOSE
   Floating Search Panel UI
==========================================================*/

export default class SearchUI {

    constructor() {

        this.create();

    }

    create() {

        this.container = document.createElement("div");

        this.container.className = "search-panel hidden";

        this.container.innerHTML = `

            <input
                type="text"
                class="search-input"
                placeholder="Search PDF..."
            >

            <button class="search-prev">↑</button>

            <button class="search-next">↓</button>

            <span class="search-count">0 / 0</span>

            <button class="search-close">✕</button>

        `;

        document.body.appendChild(this.container);

        this.input = this.container.querySelector(".search-input");

        this.prevButton = this.container.querySelector(".search-prev");

        this.nextButton = this.container.querySelector(".search-next");

        this.closeButton = this.container.querySelector(".search-close");

        this.count = this.container.querySelector(".search-count");

    }

    show() {

        this.container.classList.remove("hidden");

        this.input.focus();

    }

    hide() {

        this.container.classList.add("hidden");

    }

}