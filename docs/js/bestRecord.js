//import { FixedFrame } from "./fixed-frame.js";
//customElements.define("fixed-frame", FixedFrame);

const xmlns = "http://www.w3.org/2000/svg";

const series = ["LWC", "LDS", "LCS", "WS", "WSW"];
const sorter = (a, b) => Number(a.sorter) - Number(b.sorter);
const uniq = (acc, cur, idx, ary) => [...new Set(ary)];
const trunc = (f) => Math.trunc(100 * f) / 100;
const createScale = (xMin, xMax, aMin, aMax) => {
  return (x) => ((xMax - xMin) * (x - aMin)) / (aMax - aMin);
};

const createSVGelement = (tagName, param = {}) => {
  return ({ text = "", attr = {}, dataset = {}, cls = [] }) => {
    const elm = document.createElementNS(xmlns, tagName);
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

const createText = createSVGelement("text");
const createRect = createSVGelement("rect");
const createGroup = createSVGelement("g");

const showWins = ({ target }) => {
  const rect = target.previousElementSibling;
  target.textContent = target.dataset.wins;
  target.classList.add("show_win");
  rect.classList.add("show_win");
  setTimeout(() => {
    target.textContent = target.dataset.team;
    target.classList.remove("show_win");
    rect.classList.remove("show_win");
  }, 1500);
};

const draw = (width, height, params) => {
  const { data, champShift, maxChampShift, years, minYear, maxYear, numTeams, title, titleHeight } = params;

  const xScale = createScale(0, width, minYear - 0.75, maxYear + 0.75);
  const yScale = createScale(0, height, -maxChampShift - titleHeight, numTeams + 1);
  const fontSize = trunc(yScale(1.65) - yScale(1));
  const dy = trunc(fontSize * 0.1);
  const rectWidth = (xScale(2) - xScale(1)) * 0.9;
  const rectHeight = (yScale(2) - yScale(1)) * 0.8;
  const pad = (yScale(2) - yScale(1)) * 0.11;

  const fragment = document.createDocumentFragment();
  years
    .map((year) => {
      const g = createGroup({
        attr: {
          transform: `translate(${trunc(xScale(year))},${trunc(yScale(-champShift[year]) - yScale(0))})`,
          "font-size": fontSize,
        },
      });

      const yearText = createText({
        text: year,
        attr: {
          x: 0,
          y: trunc(yScale(0)),
          dy,
          "alignment-baseline": "middle",
        },
        dataset: { year },
        cls: ["year"],
      });
      g.appendChild(yearText);

      data
        .filter((obj) => obj.year == year)
        .map((obj) => {
          const gBox = createGroup({
            attr: {
              transform: `translate(0,${trunc(yScale(obj.place))})`,
            },
            cls: [obj.league],
          });

          if (obj.wc) gBox.classList.add(obj.wc);
          if (obj.series) gBox.classList.add(obj.series);

          const rect = createRect({
            attr: {
              x: trunc(-rectWidth * 0.5),
              y: trunc(-rectHeight * 0.5 - pad * obj.tiedWithUpper),
              width: trunc(rectWidth),
              height: trunc(rectHeight + pad * obj.tiedWithUpper + pad * obj.tiedWithLower),
            },
          });
          gBox.appendChild(rect);

          const text = createText({
            text: obj.team,
            dataset: {
              year,
              wins: obj.wins,
              place: obj.place,
              team: obj.team,
              sorter: obj.sorter,
            },
            attr: {
              dy,
              "alignment-baseline": "middle",
            },
          });
          gBox.appendChild(text);
          return gBox;
        })
        .forEach((node) => {
          g.append(node);
        });
      return g;
    })
    .forEach((node) => {
      fragment.append(node);
    });

  // title
  const heading = createText({
    text: title,
    attr: {
      x: trunc(xScale(minYear + (maxYear - minYear) * 0.5)),
      y: trunc(yScale(-maxChampShift - 1.5)),
      "font-size": fontSize * 2.5,
    },
    cls: ["title"],
  });

  fragment.append(heading);

  // legend
  const legends = [
    { text: "World Champions", yPos: 0, cls: ["WSW"] },
    { text: "League Champions", yPos: 1, cls: ["WS"] },
    { text: "Playoff", yPos: 2, cls: ["LDS"] },
    { text: "Wildcard", yPos: 3, cls: ["LWC", "WC"] },
  ];
  const legendBox = createGroup({
    attr: {
      transform: `translate(${trunc(xScale(2017))},${trunc(yScale(0) - yScale(15))})`,
      "font-size": fontSize,
    },
  });

  legends.forEach((leg) => {
    const gBox = createGroup({
      attr: {
        transform: `translate(0,${trunc(yScale(leg.yPos))})`,
      },
      cls: [...leg.cls],
    });

    const rect = createRect({
      attr: {
        x: trunc(-rectWidth * 2),
        y: trunc(-rectHeight * 0.5),
        width: trunc(rectWidth * 4),
        height: trunc(rectHeight),
      },
    });
    gBox.append(rect);

    const text = createText({
      text: leg.text,
      attr: {
        dy,
        "alignment-baseline": "middle",
      },
    });
    gBox.append(text);

    legendBox.append(gBox);
  });
  fragment.append(legendBox);

  const svg = document.querySelector("svg");
  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
  const drawarea = document.getElementById("drawarea");
  while (drawarea.firstChild) {
    drawarea.removeChild(drawarea.firstChild);
  }
  drawarea.append(fragment);

  Array.from(document.querySelectorAll(`text[data-team]`)).forEach((el) => {
    el.addEventListener("click", showWins);
  });
};

const setup_print = (pWidth, pHeight, params) => {
  const mediaQueryList = window.matchMedia("print");

  mediaQueryList.addEventListener("change", () => {
    const frame = document.querySelector(".wrapper");
    if (mediaQueryList.matches) {
      frame.setAttribute("media", "print");
      draw(pWidth, pHeight, params);
    } else {
      frame.removeAttribute("media");
      const [sWidth, sHeight] = ["width", "height"].map((prop) => Number(frame.dataset[prop]));
      draw(sWidth, sHeight, params);
    }
  });
};

const add_sorting_criteria = (obj) => {
  obj.sorter = [
    obj.year,
    300 - Number(obj.wins),
    series.includes(obj.series) ? 1 : 0,
    1 + ["WC"].indexOf(obj.wc), // flipped in 2022
    series.indexOf(obj.series) + 12,
  ].join("");
  if (obj.year == "2022" && obj.wins == 101) {
    console.log(obj);
    // NYM "2022 199 1012"
    // ATL "2022 199 1113"
  }
  return obj;
};

const add_place = (obj, idx, ary) => {
  obj.place = ary.filter((o) => o.year == obj.year).findIndex((o) => o.team == obj.team) + 1;

  obj.tiedWithUpper = obj.wins == ary[idx - 1]?.wins ? 1 : 0;
  obj.tiedWithLower = obj.wins == ary[idx + 1]?.wins ? 1 : 0;
  return obj;
};

document.addEventListener("DOMContentLoaded", async () => {
  const inputs = await (await fetch("./bestRecord.json")).json();

  const phillies2022 = inputs.find((obj) => obj.year == "2022" && obj.team == "PHI");
  const padres2022 = inputs.find((obj) => obj.year == "2022" && obj.team == "SDP");
  const astros2022 = inputs.find((obj) => obj.year == "2022" && obj.team == "HOU");
  const yankees2022 = inputs.find((obj) => obj.year == "2022" && obj.team == "NYY");
  phillies2022.series = "WS";
  padres2022.series = "LCS";
  astros2022.series = "WS";
  yankees2022.series = "LCS";
  console.log(phillies2022, padres2022, astros2022, yankees2022)

  const data = inputs.map(add_sorting_criteria).sort(sorter).map(add_place);

  const wrapper = document.querySelector(".wrapper");
  wrapper.dataset.width = window.innerWidth;
  wrapper.dataset.height = window.innerHeight;

  const svg = document.querySelector(".wrapper svg");
  svg.setAttribute("width", `${wrapper.dataset.width}px`);

  const champShift = data
    .filter((obj) => obj.series == "WSW")
    .reduce(
      (acc, cur) => {
        acc[cur.year] = cur.place;
        return acc;
      },
      { 1994: 0, 2022: 0 }
    );
  const years = data.map((obj) => Number(obj.year)).reduce(uniq, []);
  [].filter((y) => Number(y) > 2000);

  const params = {
    data,
    champShift,
    maxChampShift: Math.max(...Object.values(champShift)),
    years,
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
    numTeams: 30,
    title: `The Best Record in Baseball`,
    titleHeight: 4,
  };

  const [width, height] = ["width", "height"].map((prop) => Number(document.querySelector(".wrapper").dataset[prop]));
  draw(width < height ? height : width, height, params);

  setup_print(2970, 2100, params);
});
