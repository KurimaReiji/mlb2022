import {
  createSVG,
  createBackgroundRect,
  createRect,
  createText,
  createGroup,
  createPath,
  createCircle,
} from "./svg-utils.js";

import {
  mlbteams,
  createGameResult,
  team_selector,
  divisions,
} from "./mlb2022.js";

const teams = mlbteams
  .sort((a, b) => {
    const divs = ["East", "Central", "West"];
    if (a.league > b.league) return 1;
    if (a.league < b.league) return -1;
    if (
      divs.findIndex((d) => d === a.division) >
      divs.findIndex((d) => d === b.division)
    )
      return 1;
    if (
      divs.findIndex((d) => d === a.division) <
      divs.findIndex((d) => d === b.division)
    )
      return -1;
    if (a.name > b.name) return 1;
    if (a.name < b.name) return -1;

    return 0;
  })
  .map((o) => {
    return {
      team: o.nickname.toUpperCase(),
      code: o.code,
    };
  });

const uniq = (acc, cur, idx, ary) => {
  if (idx == ary.length - 1) acc = [...new Set(ary)];
  return acc;
};

const get_record = (team) => {
  const grp = document.querySelector(`[data-team="${team}"]`);
  const win = grp.querySelectorAll(`[data-result="win"]`).length;
  const loss = grp.querySelectorAll(`[data-result="loss"]`).length;
  return { win, loss };
};

const getXY = (num, total, box) => {
  let [x, y] = [0, 0];
  x = (num - 1) * (box.width + box.xShift);
  if (total > 10) {
    // 2 rows, 1st 1-5,15-19, 2nd 6-14
    if (num > 5 && num < 15) {
      y = box.height + box.yShift * 0.6;
      x = (num - 5.5) * (box.width + box.xShift);
    } else if (num > 14) {
      x = (num - 10) * (box.width + box.xShift);
    }
  }
  return { x, y };
};

const get_number_of_matches = (team) => (matchups) => {
  return matchups
    .filter((g) => [g.home, g.road].includes(team))
    .reduce((acc, cur) => {
      //{home: 'ASTROS', road: 'ANGELS', num: 10}
      const opp = [cur.home, cur.road].filter((t) => t !== team)[0];
      const idx = acc.findIndex((o) => o.opponent === opp);
      if (idx >= 0) {
        acc[idx].num += cur.num;
      } else {
        acc.push({ opponent: opp, num: cur.num });
      }
      return acc;
    }, []);
};

const get_group_by_division = (numberOfMatches) => {
  return divisions
    .map((obj) => obj.division)
    .map((div) => {
      const teams = mlbteams
        .filter((t) => div === `${t.league} ${t.division}`)
        .map((t) => t.nickname.toUpperCase());
      const num = numberOfMatches
        .filter((obj) => teams.includes(obj.opponent))
        .reduce((acc, cur) => acc + cur.num, 0);
      return { division: div, num };
    });
};

const get_logo = (team) => (images) => {
  const idx = images.findIndex((o) => o.team === team);
  return document
    .querySelector("#logos")
    .content.querySelectorAll("svg")
    [idx].cloneNode(true);
};

const create_title = (text) => {
  return createText({
    text,
    attr: {
      x: 0.5 * width,
      y: 0.03 * height,
      "alignment-baseline": "middle",
      "text-anchor": "middle",
      "font-size": 40,
    },
  });
};

const create_team_logo = (team) => {
  const [x, y] = [0.02 * width, 0.78 * height];
  const logo = createGroup({
    attr: {
      transform: `translate(${x},${y})`,
    },
  });
  const img = get_logo(team)(teams);
  img.setAttribute("width", 0.15 * height);
  img.setAttribute("height", 0.15 * height);
  logo.append(img);
  return logo;
};

const create_team_record = (team) => {
  const { win, loss } = get_record(team);
  return createText({
    text: `${win}-${loss}`,
    attr: {
      x: 0.02 * width + 0.15 * 0.5 * height,
      y: height - 54,
      "font-size": 60,
      "alignment-baseline": "middle",
      "text-anchor": "middle",
    },
    cls: ["record"],
  });
};

const svgdownload = (filename, svg = null) => {
  const delay = (msec) => new Promise((r) => setTimeout(r, msec));
  svg = svg || document.querySelector("svg");
  const svgData = new XMLSerializer().serializeToString(svg);

  const canvas = document.createElement("canvas");
  canvas.width = 1200; // svg.width.baseVal.value;
  canvas.height = 1600; // svg.height.baseVal.value;
  const ctx = canvas.getContext("2d");
  const image = new Image();

  return new Promise((resolve, reject) => {
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      var a = document.createElement("a");
      a.href = canvas.toDataURL("image/png");
      a.setAttribute("download", filename);
      delay(500).then(() => {
        a.dispatchEvent(new MouseEvent("click"));
        console.log(filename);
        resolve(filename);
      });
    };
    image.src =
      "data:image/svg+xml;charset=utf-8;base64," + window.btoa(svgData);
  });
};
window.svgdownload = svgdownload;

const main_handler = () => {
  const byDivisionByCity = (a, b) => {
    return [b, a]
      .map((opp) => {
        const t = mlbteams.find((o) => o.nickname.toUpperCase() === opp);
        const div = `${t.league} ${t.division}`;
        const c1 = grpByDivision.find((o) => o.division === div).num;
        const c2 = divisions.findIndex((d) => d.division === div);
        //const c3 = 30 - records.findIndex((obj) => obj.team === opp);
        const c3 = 30 - teams.findIndex((obj) => obj.team === opp);
        return Number(
          [c1, c2, c3].map((n) => n.toString().padStart(3, "0")).join("")
        );
      })
      .reduce((acc, cur) => acc - cur);
  };

  const url = new URL(window.location);
  const team = url.searchParams.get("team") || "ANGELS";

  const games = results.map(createGameResult).filter(team_selector(team));
  const numberOfMatches = get_number_of_matches(team)(matchups);
  const opponents = numberOfMatches.map((o) => o.opponent);
  const grpByDivision = get_group_by_division(numberOfMatches);

  const data = opponents.sort(byDivisionByCity).map((opp) => {
    return {
      team: opp,
      num: numberOfMatches.find((o) => o.opponent === opp).num,
    };
  });

  const draw = () => {
    const xRange = [0, width];
    const yRange = [0, height];

    const fragment = document.createDocumentFragment();
    const svg = createSVG(xRange, yRange);
    const css = document.querySelector("style").cloneNode(true);
    const bgRect = createBackgroundRect(svg);

    const gResults = createGroup({
      dataset: {
        team,
        winner: team,
      },
    });

    const divGroups = data
      .map((obj) => mlbteams.find((t) => t.nickname.toUpperCase() === obj.team))
      .map((t) => `${t.league} ${t.division}`)
      .reduce(uniq)
      .map((division) => {
        const gDivisions = createGroup({
          atrr: {
            transform: `translate(0,0)`,
          },
          dataset: {
            division,
          },
        });
        const rows = data
          .filter((obj) => {
            const t = mlbteams.find(
              (t) => t.nickname.toUpperCase() === obj.team
            );
            return division === `${t.league} ${t.division}`;
          })
          .map((obj, i) => {
            const grp = createGroup({
              dataset: {
                team: obj.team,
                num: obj.num,
                row: i,
                y: i * (box.height + box.yShift),
                order: i,
              },
            });
            const slots = [
              ...new Array(
                numberOfMatches.find((o) => o.opponent === obj.team).num
              ),
            ].map((x, i, ary) => {
              return createRect({
                attr: Object.assign(getXY(i + 1, ary.length, box), {
                  width: box.width,
                  height: box.height,
                }),
                dataset: {
                  num: i + 1,
                  result: "togo",
                },
              });
            });
            grp.append(...slots);
            return grp;
          });
        gDivisions.append(...rows);
        return gDivisions;
      });

    gResults.append(...divGroups);

    fragment.append(css, bgRect, gResults);
    svg.append(fragment);
    const canvas = document.querySelector(".canvas");
    canvas.replaceChildren(svg);
    return svg;
  };

  const apply_results = () => {
    document.querySelectorAll(`[data-row]`).forEach((rowGrp, i) => {
      const divGrp = rowGrp.closest(`[data-division]`);
      const bbox = rowGrp.getBBox();
      const order = Number(rowGrp.dataset.order);
      // horizontal center of divGrp
      const x = 0.5 * (divGrp.getBBox().width - bbox.width);
      const y = order * (bbox.height + box.yShift);
      rowGrp.setAttribute("transform", `translate(${x},${y})`);
      rowGrp.dataset.x = x;
    });

    const wrapper = {
      el: document.querySelector(`[data-team]`),
    };

    document.querySelectorAll(`[data-division]`).forEach((divGrp, i, ary) => {
      const bbox = divGrp.getBBox();
      const x = 0.5 * (wrapper.el.getBBox().width - bbox.width);
      const y = [...ary]
        .slice(0, i)
        .reduce(
          (acc, cur) => acc + cur.getBBox().height + box.yShift * 2.15,
          0
        );
      divGrp.setAttribute("transform", `translate(${x},${y})`);
      divGrp.dataset.width = bbox.width;
      divGrp.dataset.height = bbox.height;
    });

    wrapper.x = 0.5 * (width - wrapper.el.getBBox().width);
    wrapper.y = 0.75 * (height - wrapper.el.getBBox().height);

    document
      .querySelector(`[data-team]`)
      .setAttribute("transform", `translate(${wrapper.x},${wrapper.y})`);

    opponents.forEach((opp) => {
      const grp = svg.querySelector(`[data-team="${opp}"]`);
      const divGroup = grp.closest(`[data-division]`);
      const bbox = grp.getBBox();
      const x = 20 + Number(divGroup.dataset.width) - Number(grp.dataset.x);
      const y = -0.1 * bbox.height;
      const logo = createGroup({
        attr: {
          transform: `translate(${x},${y})`,
        },
      });
      const img = get_logo(opp)(teams);
      img.setAttribute("width", Math.min(1.2 * bbox.height, 2.6 * box.height));
      img.setAttribute("height", Math.min(1.2 * bbox.height, 2.6 * box.height));
      logo.append(img);
      grp.append(logo);
    });

    games.forEach((g) => {
      const opp = [g.winner, g.loser].filter((t) => t !== team)[0];
      const rects = [
        ...svg.querySelectorAll(`[data-team="${opp}"] rect`),
      ].filter((r) => r.dataset.result === "togo");
      if (g.winner === team) {
        const r = rects[0];
        if (r) {
          r.dataset.result = "win";
          r.dataset.winner = team;
        }
      } else if (g.loser === team) {
        const r = rects.slice(-1)[0];
        if (r) {
          r.dataset.result = "loss";
          r.dataset.winner = opp;
          r.setAttribute("height", 0.7 * box.height);
          r.setAttribute("transform", `translate(0, ${0.15 * box.height})`);
        }
      }
    });

    divisions
      .map((o) => o.division)
      .filter((div) => svg.querySelector(`[data-division="${div}"]`))
      .forEach((div) => {
        const grp = svg.querySelector(`[data-division="${div}"]`);
        const bbox = grp.getBBox();
        const win = grp.querySelectorAll(`[data-result="win"]`).length;
        const loss = grp.querySelectorAll(`[data-result="loss"]`).length;
        const i = createPath({
          attr: {
            fill: "none",
            d: `M ${bbox.x - 120} ${bbox.y} h 90 v ${bbox.height}`,
            stroke:
              "var(--stroke-color, var(--win-stroke-color, var(--team-color, black)))",
            "stroke-width": 4,
          },
          cls: ["line"],
        });
        const rec = createText({
          text: `${win}-${loss}`,
          attr: {
            "font-size": 30,
            x: bbox.x - 40,
            y: 22,
            "alignment-baseline": "middle",
            "text-anchor": "end",
          },
        });
        grp.append(rec, i);
      });

    const teamLogo = create_team_logo(team);
    const teamRecord = create_team_record(team);
    const title = create_title(`2022 Head-to-Head Results`);
    svg.append(teamLogo, teamRecord, title);

    [
      ...document.querySelectorAll(`[data-result="win"]+[data-result="loss"]`),
    ].forEach((r) => {
      const wRect = r.previousElementSibling;
      const c = createCircle({
        attr: {
          cx: 2 + r.getBBox().x - box.xShift * 0.5,
          cy: 0.5 * Number(wRect.getAttribute("height")) + Number(r.getAttribute("y")),
          r: box.xShift * 0.2,
        },
        cls: ["divider"],
      });
      r.parentNode.insertBefore(c, r);
    });
  };

  const svg = draw(team);

  apply_results();
};

const resultsurl = `./mlb2022-results.json`;
const results = await (await fetch(resultsurl, { cache: "no-cache" })).json();

const matchupsurl = `./mlb2022-matchups.json`;
const matchups = await (await fetch(matchupsurl, { })).json();

const [width, height] = [1200, 1600];
const box = {
  width: 66,
  height: 40,
  xShift: 24,
  yShift: 20,
};

const divs = teams.map((obj) => {
  const team = obj.team;
  const logo = get_logo(team)(teams);
  const div = document.createElement("div");
  div.append(logo);
  div.dataset.team = team;
  return div;
});

const switcher = document.querySelector(".switcher");
switcher.append(...divs);
switcher.classList.add("six-rows");

document.querySelectorAll(".switcher>div").forEach((div) => {
  div.addEventListener("click", ({ currentTarget }) => {
    const team = currentTarget.dataset.team;
    console.log(team);
    const url = new URL(window.location);
    url.searchParams.set("team", team);
    window.history.pushState(null, "", url);
    main_handler();
  });
  div.classList.add("clickable");
});

const set_variables = () => {
  document.documentElement.style.setProperty(
    "--inner-height",
    `${window.innerHeight}px`
  );
  document.documentElement.style.setProperty(
    "--canvas-width",
    `${0.75 * window.innerHeight}px`
  );
  document.documentElement.style.setProperty(
    "--canvasx-height",
    `${Math.min(1 * window.innerHeight, 1.1 * window.innerWidth)}px`
  );
  document.documentElement.style.setProperty(
    "--canvas-height",
    window.getComputedStyle(document.querySelector(".canvas")).height
  );
};
window.addEventListener("popstate", (e) => {
  main_handler();
});

window.addEventListener("orientationchange", set_variables);

set_variables();
main_handler();
