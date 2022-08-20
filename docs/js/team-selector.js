import { createElement } from "./utils.js";
import { get_teams, get_logos } from "./mlb-logos.js";

class TeamSelector extends HTMLElement {
  static get observedAttributes() {
    return ["season"];
  }

  constructor() {
    super();
  }

  render_logos(season) {
    const teams = get_teams(season);
    const logos = get_logos(season);
    const divs = teams.map((team) => {
      const logo = logos[team];
      const div = createElement("div")({
        dataset: {
          team,
        },
      });
      div.append(logo.cloneNode(true));
      return div;
    });
    const switcher = this.shadowRoot.querySelector(".switcher");
    switcher.replaceChildren(...divs);

    this.shadowRoot.querySelectorAll(".switcher>div").forEach((div) => {
      div.addEventListener("click", ({ currentTarget }) => {
        const event = new CustomEvent("team-selected", {
          bubbles: true,
          composed: true,
          detail: { team: currentTarget.dataset.team },
        });
        this.dispatchEvent(event);
      });
      div.classList.add("clickable");
    });
  }

  render(season = 2022) {
    const style = `<style>
    .switcher div {
      text-align: center;
    }
    .switcher div svg {
      width: 90%;
      height: 90%;
    }
    .six-rows {
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      width: auto;
      margin: 2vmax 0;
    }
    .six-rows div {
      flex-basis: 18%;
      height: min(40px, 8vmin);
      display: grid;
      place-content: center;
    }
    .six-rows div:nth-of-type(n+16):nth-of-type(-n+20) {
      margin-top: 2vmax;
    }    
    </style>`;
    const html = `<div class="switcher six-rows"></div>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `${style}${html}`;

    this.render_logos(season);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === "season") {
      this.render_logos(newValue);
    }
  }

  connectedCallback() {
    this.season = Number(this.getAttribute("season") || 2022);
    this.render(this.season);
  }
}

export { TeamSelector };
