import { createElement } from "./utils.js";

class SeasonSelector extends HTMLElement {
  static get observedAttributes() {
    return ["min", "max"];
  }

  constructor() {
    super();
  }

  render() {
    const clickHandler = (e) => {
      e.preventDefault();
      const event = new CustomEvent("season-selected", {
        bubbles: true,
        composed: true,
        detail: { season: e.currentTarget.dataset.season },
      });
      this.dispatchEvent(event);
    };

    const style = `<style>
    :host {
      display: flex;
      margin-bottom: .5vh;
    }
    div {
      flex-basis: 18%;
      flex-grow: 1;
      height: min(40px, 8vmin);
      display: grid;
      place-content: center;
    }
    div>svg {
      width: 90%;
      height: 6vmin;
    }
    </style>`;
    const html = `
    <div>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 20"><rect x="0" y="0" fill="none" width="30" height="20"></rect><text class="season" x="15" y="10" alignment-baseline="middle" text-anchor="middle" font-size="10">2018</text></svg>
    </div>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `${style}${html}`;
    const css = this.shadowRoot.querySelector("style").cloneNode(true);
    const divs = [2018, 2019, 2020, 2021, 2022].map((season) => {
      const div = this.shadowRoot.querySelector("div").cloneNode(true);
      div.querySelector(".season").textContent = season;
      div.dataset.season = season;
      return div;
    });
    this.shadowRoot.replaceChildren(css, ...divs);

    this.shadowRoot.querySelectorAll("div").forEach((div) => {
      div.addEventListener("click", clickHandler);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {}

  connectedCallback() {
    this.render();
  }
}

export { SeasonSelector };
