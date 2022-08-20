import { H2hCanvas } from "./h2h-canvas.js";
import { TeamSelector } from "./team-selector.js";
import { SeasonSelector } from "./season-selector.js";
customElements.define("h2h-canvas", H2hCanvas);
customElements.define("team-selector", TeamSelector);
customElements.define("season-selector", SeasonSelector);

const init = () => {
  const url = new URL(window.location);
  const canvas = document.querySelector("#canvas");
  canvas.setAttribute("team", url.searchParams.get("team") || "ANGELS");
  canvas.setAttribute("season", url.searchParams.get("season") || "2022");
};

const set_variables = () => {
  document.documentElement.style.setProperty("--canvas-height", "unset");
  const canvas = document.querySelector("#canvas");
  canvas.classList.remove("short");

  setTimeout(() => {
    ["unset", `${window.innerHeight}px`].forEach((val) => {
      document.documentElement.style.setProperty("--inner-height", val);
    });
    const [canvasHeight, canvasWidth] = ["height", "width"].map((prop) => {
      return Number(getComputedStyle(canvas)[prop].replace("px", ""));
    });
    document.documentElement.style.setProperty(
      "--canvas-height",
      `${Math.min(canvasHeight, 1.333 * canvasWidth)}px`
    );
    canvas.classList.add("short");
  }, 200);
};

screen?.orientation?.addEventListener("change", set_variables);

window.addEventListener("popstate", (e) => {
  const url = new URL(window.location);
  const canvas = document.querySelector("#canvas");
  canvas.setAttribute("team", url.searchParams.get("team") || "ANGELS");
  canvas.setAttribute("season", url.searchParams.get("season") || "2022");
});

window.addEventListener("season-selected", ({ detail }) => {
  ["#canvas", "team-selector"].forEach((prop) => {
    document.querySelector(prop).setAttribute("season", detail.season);
  });
});

window.addEventListener("team-selected", ({ detail }) => {
  document.querySelector("h2h-canvas").setAttribute("team", detail.team);
});

set_variables();
init();
