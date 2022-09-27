import { MlbMenubar } from "mlb-menubar";
import {
  createSVG,
  createGroup,
  createPath,
  createText,
  createTextbox,
  createBackgroundRect,
  createScale,
  createTics,
  createAxis,
  trunc,
  svgdownload,
} from "svg-utils";

import {
  mlbteams,
  createGameResult,
  team_selector,
  teams_by_wpct,
} from "mlb2022";

let frame_width, frame_height;

const moveTo = (series, params, n = 162) => {
  const { xScale, yScale } = params.scales;
  const gSeries = document.querySelector(".series");
  gSeries.replaceChildren();
  [...series].reverse().forEach((s) => {
    const team = s.team;
    const g = createGroup({
      attr: {
        id: team,
      },
      cls: [team, "series"],
    });

    const path = createPath({
      attr: Object.assign({}, params.path, {
        d:
          `M ${xScale(0)} ${yScale(0)}` +
          s.values.map((w, i) => ` L ${xScale(w.x)} ${yScale(w.y)}`).join(""),
      }),
    });
    g.append(path);

    const labelText = createText({
      text: `${team} (${s.win}-${s.loss})`,
      attr: Object.assign({}, params.label, {
        x: xScale(n) + params.padding.right * 0.1,
        y: yScale(s.values.slice(-1)[0].y),
      }),
      dataset: { y: s.values.slice(-1)[0].y },
      cls: ["label"],
    });
    g.append(labelText);

    gSeries.append(g);
  });

  const targetLabels = [...document.querySelectorAll(`.label`)].reverse();
  fix_overlapping(targetLabels);
};

const fix_overlapping = (targets) => {
  const isOverlapped = (y, i, ary) => {
    if (!ary[i + 1]) return false;
    return y + h > ary[i + 1];
  };
  const h = Number(targets[0].getAttribute("font-size"));
  const step = h * 0.125;
  let bboxes = targets.map((el) => el.getBBox().y);

  const maxCounter = 100;
  let counter = 0;
  while (bboxes.some(isOverlapped)) {
    if (counter++ > maxCounter) {
      console.log(`break: ${counter}`);
      break;
    }
    const idx0 = bboxes.findIndex(isOverlapped);
    const label0 = targets[idx0];
    const y0 = Number(label0.getAttribute("y"));
    label0.setAttribute("y", trunc(y0 - step));

    const label1 = targets[idx0 + 1];
    const y1 = Number(label1.getAttribute("y"));
    label1.setAttribute("y", trunc(y1 + step));
    bboxes = targets.map((el) => el.getBBox().y);
  }
};

const chart_param_builder = (series, predefined = {}) => {
  console.log(`predefined`);
  console.log(predefined);
  const width =
    predefined.width ||
    Math.trunc(
      Number(
        window
          .getComputedStyle(document.querySelector(".frame"))
          .width.replace("px", "")
      )
    );
  const height = predefined.height || .99 * Math.trunc(width / predefined.aspect);
  const yMax = Math.max(...series.map((s) => s.max));
  const yMin = Math.min(...series.map((s) => s.min));
  const num = Math.max(...series.map((s) => s.values.length));
  const xAxis = [0, 5 - (num % 5) + num];
  const yAxis = [yMin - 2, yMax + 2].map((n) =>
    n % 5 == 0 ? n + Math.sign(n) : n
  );
  const xDomain = xAxis;
  const yDomain = [...yAxis].reverse();
  const vw = trunc(width * 0.01);
  const [xRange, yRange] = [
    [0, width],
    [0, height],
  ];
  const padding = {
    top: trunc(Math.min(height * 0.08, 5 * vw)),
    right: trunc(width * 0.17),
    bottom: trunc(Math.min(height * 0.05, 4 * vw)),
    left: trunc(width * 0.045),
  };
  const xScale = createScale(xDomain, xRange, padding.left, padding.right);
  const yScale = createScale(yDomain, yRange, padding.top, padding.bottom);
  const dx = trunc(xScale(1) - xScale(0));
  const dy = trunc(yScale(0) - yScale(1));
  const scales = { xScale, yScale, dx, dy };
  const xShift = 0;
  const axis = {
    pathStyle: { "stroke-width": 0.3 * vw },
    lines: [
      [
        [xScale(xAxis[0]), yScale(0)],
        [xScale(xAxis[1]), yScale(0)],
      ],
      [
        [xScale(xShift), yScale(yAxis[0])],
        [xScale(xShift), yScale(yAxis[1])],
      ],
    ],
  };

  const xTics = "0,10,20,30,40,50,60,70,80,90,100,110,120,130,140,150,160"
    .split(",")
    .filter((n) => n <= xAxis[1])
    .filter((n, i, a) => (a.length > 8 ? n % 20 == 0 : true))
    .concat([xAxis[1]])
    .map((n) => {
      return {
        pos: n,
        text: n == 162 ? "" : n,
      };
    });

  const yTics = [...new Array(30)]
    .map((n, i) => i * 5 - 60)
    .filter((n) => n < yAxis[1] && n > yAxis[0])
    .map((n) => {
      return { pos: n, text: n };
    });

  const tics = {
    xAxis: xAxis.map((v) => trunc(xScale(v))),
    yAxis: yAxis.map((v) => trunc(yScale(v))),
    xTics: xTics.map((o) => Object.assign(o, { pos: trunc(xScale(o.pos)) })),
    yTics: yTics.map((o) => Object.assign(o, { pos: trunc(yScale(o.pos)) })),
    xTicsPos: trunc(xScale(xShift) - width * 0.01),
    yTicsPos: trunc(yScale(yAxis[0]) + padding.bottom * 0.4),
    pathStyle: {
      "stroke-width": 0.1 * vw,
    },
    labelStyle: {
      "font-size": 1.5 * vw,
      "alignment-baseline": "middle",
    },
  };

  const title = {
    text: "Title Text",
    attr: {
      x: width * 0.5,
      y: trunc(Math.min(height * 0.05, (padding.top + 24) * 0.5)),
      "font-size": 24,
      "text-anchor": "middle",
      "alignment-baseline": "middle",
    },
    cls: ["title"],
  };

  const path = {
    fill: "none",
    "stroke-width": Math.min(dx, 0.6 * vw),
    "stroke-linejoin": "round",
    "stroke-linecap": "round",
  };
  const dot = {
    r: Math.min(dx * 0.5, 0.6 * vw),
  };
  const label = {
    "font-size": trunc(1.75 * vw),
    "alignment-baseline": "middle",
  };

  return {
    xRange,
    yRange,
    padding,
    scales,
    xShift,
    axis,
    tics,
    title,
    path,
    dot,
    label,
    num,
  };
};

const draw_chart = (params) => {
  const { xRange, yRange, tics, axis, title } = params;
  const canvas = document.querySelector(".frame");
  const fragment = document.createDocumentFragment();

  const svg = createSVG(xRange, yRange);

  const css = document.querySelector("style").cloneNode(true);
  const bgRect = createBackgroundRect(svg);
  const gTics = createTics(tics);
  const gAxis = createAxis(axis);
  const gSeries = createGroup({ cls: ["series"] });
  const gTitle = createTextbox(title);

  fragment.append(css, bgRect, gTics, gAxis, gSeries, gTitle);
  svg.append(fragment);
  canvas.replaceChildren(svg);
};

const main_handler = (series, league = "AL", division = "West") => {
  const selected = series.filter(
    (s) => s.league == league && s.division == division
  );
  const params = chart_param_builder(selected, {
    aspect: trunc(frame_width / frame_height),
    width: 1152, height: Math.trunc(1 * Math.trunc(1152 / (frame_width / frame_height)))
  });
  params.title.text = `Games above .500, ${league} ${division} 2022`;
  draw_chart(params);
  document.querySelector("mlb-menubar").setAttribute(
    "date",
    selected
      .map((s) => s.endDate)
      .sort()
      .slice(-1)[0]
  );
  //moveTo(selected, params, 5 - (params.num % 5) + params.num);
  moveTo(selected, params, 162);
  set_page_title(`Games above .500, ${league} ${division} 2022`);
};

const make_series = (games, mlbteams) => {
  return mlbteams
    .map(({ code, nickname, league, division }) => {
      const myGames = games.filter(team_selector(nickname.toUpperCase()));
      const values = myGames
        .map((g, i) => (g.winner == nickname.toUpperCase() ? 1 : -1))
        .map((wl, i, ary) => {
          return {
            x: i + 1,
            y: ary.slice(0, i + 1).reduce((a, c) => a + c, 0),
            wl,
          };
        });
      return {
        team: code,
        league,
        division,
        win: values.filter((o) => o.wl == 1).length,
        loss: values.filter((o) => o.wl == -1).length,
        values,
        max: Math.max(...values.map((o) => o.y)),
        min: Math.min(...values.map((o) => o.y)),
        endDate: myGames.slice(-1)[0].date,
      };
    })
    .sort(teams_by_wpct);
};

const capitalize = (word) => {
  return `${word[0].toUpperCase()}${word.slice(1).toLowerCase()}`;
};

customElements.define("mlb-menubar", MlbMenubar);

const jsonfile = `https://kurimareiji.github.io/mlb2022/mlb2022-results.json`;
const inputs = await (await fetch(jsonfile, { cache: "no-cache" })).json();
const games = inputs.map(createGameResult);
const series = make_series(games, mlbteams);

const fix_frame_size = (values = [false, false]) => {
  const frame = document.querySelector(".frame");
  return ["width", "height"].map((prop, i) => {
    const val = Math.trunc(
      Number(window.getComputedStyle(frame)[prop].replace("px", ""))
    );
    console.log(`--frame-${prop}`, `${values[i] || val}px`);
    frame.style.setProperty(`--frame-${prop}`, `${values[i] || val}px`);
    return values[i] || val;
  });
};
[frame_width, frame_height] = fix_frame_size();

window.capture = (x = 1080, y = 1080) => {
  document.documentElement.style.setProperty("--page-height", "auto");
  document.querySelector(".frame").style.flex = "auto";
  [frame_width, frame_height] = fix_frame_size([x, y]);
  console.log(`w: ${frame_width}`);
  route(location.pathname);
};

const set_page_title = (title) => {
  document.querySelector("title").textContent = title;
};

const route = (pathname) => {
  const [league, division] = pathname.match(/(AL|NL|east|west|central)/gi);
  main_handler(series, league.toUpperCase(), capitalize(division));
};

route(location.pathname);

window.addEventListener("popstate", (e) => {
  route(location.pathname);
});

window.addEventListener("division-selected", ({ detail }) => {
  main_handler(series, detail.league, detail.division);
});

window.addEventListener("download-svg", ({ detail }) => {
  svgdownload(detail.outfile);
});
