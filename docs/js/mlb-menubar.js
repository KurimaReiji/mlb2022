import { mlbteams } from "./mlb2022.js";

const createElement = (tagName) => {
  return ({ text = "", attr = {}, dataset = {}, cls = [] }) => {
    const elm = document.createElement(tagName);
    elm.textContent = text;
    Object.keys(dataset).forEach((key) => {
      elm.dataset[key] = dataset[key];
    });
    Object.keys(attr).forEach((name) => {
      elm.setAttribute(name, attr[name]);
    });
    cls.forEach((name) => {
      elm.classList.add(name);
    });
    return elm;
  };
};


const leagues = ["AL", "NL"];
const divisions = ["West", "Central", "East"];

class MlbMenubar extends HTMLElement {
  static get observedAttributes() {
    return ["date"];
  }

  constructor() {
    super();
  }

  render() {
    const style = `<style>
    ul {
      list-style: none;
      margin: 0 0 3px 0; padding: 0;
      box-sizing: border-box;
      font-size: min(2vw, 16px);
      display: flex;
      align-items: center;
      background-color: var(--mlb-blue);
      box-shadow: rgb(0 0 0) 1px 0px 5px;
    }
    li {
      margin: 0; padding: 0;
      color: white;
    }
    li:nth-of-type(1),
    li:nth-last-of-type(1) {
      background-color: var(--mlb-blue);
    }
    li:nth-of-type(1) {
      padding: .5em .5em;
    }
    a {
      display: block;
      text-align: center;
      text-decoration: none;
      color: inherit;
      padding: .5em .5em;
      background-color: var(--item-bg-color, yellow);
    }
    a:hover {
      color: var(--hover-bg-color, --mlb-blue);
      background-color: var(--hover-text-color, white);
    }
    a[data-league="AL"] {
      --item-bg-color: var(--mlb-red);
      --hover-bg-color: var(--mlb-red);
    }
    a[data-league="NL"] {
      --item-bg-color: var(--mlb-navy);
      --hover-bg-color: var(--mlb-navy);
    }
    li:nth-last-of-type(1) {
      margin-left: auto;
      padding: .25em .5em;
    }
    #download {
      padding: .25em;
      border: 1px solid var(--mlb-blue);
    }
    #download:hover {
      cursor: pointer;
      border: 1px solid white;
    }

    </style>`;
    const html = `
<ul id="menu">
  <li>MLB2022</li>
</ul>`;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `${style}${html}`;

    const menu = this.shadowRoot.querySelector("ul");
    const items = leagues
      .map((league) => {
        return divisions.map((division) => {
          return createElement("a")({
            text: `${league} ${division}`,
            dataset: {
              league,
              division,
            },
            attr: {
              href: "#",
            },
          });
        });
      })
      .flat()
      .concat(
        createElement("div")({
          text: "Download",
          attr: {
            id: "download",
            title: "as png",
          },
        })
      )
      .map((item) => {
        const li = document.createElement("li");
        li.append(item);
        return li;
      });
    menu.append(...items);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "date") {
      this.download.dataset.date = newValue;
    }
  }

  route(pathname) {
    history.pushState(null, null, pathname);
    console.log(`pushed: ${pathname}`);
  }

  connectedCallback() {
    this.render();
    this.download = this.shadowRoot.getElementById("download");
    this.league = "AL";
    this.division = "West";

    [...this.shadowRoot.querySelectorAll("#menu a")].forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        this.league = e.target.dataset.league;
        this.division = e.target.dataset.division;
        const pathname = `/${this.league.toLowerCase()}${this.division.toLowerCase()}.html`;
        const event = new CustomEvent("division-selected", {
          bubbles: true,
          composed: true,
          detail: {
            league: this.league,
            division: this.division,
          },
        });
        this.dispatchEvent(event);
        if (pathname != location.pathname) {
          this.route(pathname);
        }
      });
    });

    this.download.addEventListener("click", ({ target }) => {
      const outfile = `${this.league}${this.division.toLowerCase()}-${target.dataset.date
        }.png`;
      const event = new CustomEvent("download-svg", {
        bubbles: true,
        composed: true,
        detail: { outfile },
      });
      this.dispatchEvent(event);
    });
  }
}

export { MlbMenubar };
