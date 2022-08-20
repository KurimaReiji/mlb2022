import {
  createRect,
  createText,
  createGroup,
  createPath,
  createCircle,
} from "./svg-utils.js";

import { get_logos, get_teams } from "./mlb-logos.js";
import { gamelogs } from "./mlb-2018-2021.js";
import {
  mlbteams,
  createGameResult,
  team_selector,
  divisions,
} from "./mlb2022.js";

const uniq = (acc, cur, idx, ary) => {
  if (idx == ary.length - 1) acc = [...new Set(ary)];
  return acc;
};

const box = {
  width: 66,
  height: 40,
  xShift: 24,
  yShift: 20,
};

const slotRect = createRect({
  attr: {
    x: 0,
    y: 0,
    width: box.width,
    height: box.height,
  },
});

const empty_results_group = (svg, team) => {
  const gResults = svg.querySelector("#results");
  gResults.replaceChildren();
  gResults.removeAttribute("transform");
  ["team", "winner"].forEach((prop) => {
    gResults.dataset[prop] = team;
  });
};

const add_team_logo = (svg, logo) => {
  const { height } = svg.getBBox();
  const grp = svg.getElementById("teamLogo");
  logo.setAttribute("width", 0.15 * height);
  logo.setAttribute("height", 0.15 * height);
  grp.replaceChildren(logo.cloneNode(true));
};

const update_title = (svg, season) => {
  const svgTitle = svg.querySelector("#title text");
  const title = svgTitle.textContent.replace(/20\d\d/, season);
  svgTitle.textContent = title;
  svgTitle.dataset.season = season;
  document.querySelector("title").textContent = title;
};

const get_matchups = (results) => {
  return results
    .map((g) => {
      return {
        home: g.home,
        road: g.road,
      };
    })
    .reduce((acc, cur) => {
      const idx = acc.findIndex(
        (o) => o.home === cur.home && o.road === cur.road
      );
      const obj = idx >= 0 ? acc[idx] : Object.assign({}, cur, { num: 0 });
      obj.num += 1;
      if (idx === -1) {
        acc.push(obj);
      } else {
        acc[idx] = obj;
      }
      return acc;
    }, []);
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

const getXY = (num, total, box) => {
  let [x, y] = [0, 0];
  x = (num - 1) * (box.width + box.xShift);
  if (total > 10) {
    // total: 19 or 20
    // 2 rows, 1st 1-5,15-19, 2nd 6-14
    // 2 rows, 1st 1-5,16-20, 2nd 6-15
    if (num > 5 && num < total - 4.5) {
      y = box.height + box.yShift * 0.6;
      x = (num - 6 + 0.5 * (total % 2)) * (box.width + box.xShift);
    } else if (num > total - 4.5) {
      x = (num - 11 + (total % 2)) * (box.width + box.xShift);
    }
  }
  return { x, y };
};

const align_rows_in_divisions = (svg) => {
  [...svg.querySelectorAll(`[data-division]`)].forEach((divGrp) => {
    [...divGrp.querySelectorAll(`[data-row]`)].forEach((rowGrp, order) => {
      const { width: rowWidth, height: rowHeight } = rowGrp.getBBox();
      // horizontal center of divGrp
      const x = 0.5 * (divGrp.getBBox().width - rowWidth);
      const y = order * (rowHeight + box.yShift);
      rowGrp.setAttribute("transform", `translate(${x},${y})`);
    });
  });
};

const align_division_group = (svg) => {
  svg.querySelectorAll(`[data-division]`).forEach((divGrp, i, ary) => {
    const { width, height } = divGrp.getBBox();
    const { width: wrapperWidth } = svg.querySelector("#results").getBBox();
    const x = 0.5 * (wrapperWidth - width);
    const y = [...ary]
      .slice(0, i)
      .reduce((acc, cur) => acc + cur.getBBox().height + box.yShift * 2.15, 0);
    divGrp.setAttribute("transform", `translate(${x},${y})`);
  });
};

const align_results_group = (svg) => {
  const grp = svg.querySelector("#results");
  const { width, height } = svg.getBBox();
  const { width: grpWidth, height: grpHeight } = grp.getBBox();
  const x = 0.5 * (width - grpWidth);
  const y = Math.min(100, 20 + 0.5 * (height - grpHeight));
  grp.setAttribute("transform", `translate(${x},${y})`);
};

const add_logos_of_opponents = (svg, logos) => {
  [...svg.querySelectorAll(`[data-division]`)].forEach((divGroup) => {
    const { width: divWidth } = divGroup.getBBox();
    [...divGroup.querySelectorAll(`[data-team]`)].forEach((grp) => {
      const { width: grpWidth, height: grpHeight } = grp.getBBox();
      const x = 20 + divWidth - 0.5 * (divWidth - grpWidth);
      const y = -0.1 * grpHeight;
      const logo = createGroup({
        attr: {
          transform: `translate(${x},${y})`,
        },
      });
      const img = logos[grp.dataset.team];
      ["width", "height"].forEach((prop) => {
        img.setAttribute(prop, Math.min(1.2 * grpHeight, 90));
      });
      logo.append(img);
      grp.append(logo);
    });
  });
};

const add_records_against_each_division = (svg) => {
  [...svg.querySelectorAll(`[data-division]`)].forEach((grp) => {
    const { x, y, height } = grp.getBBox();
    const line = createPath({
      attr: {
        d: `M ${x - 120} ${y} h 90 v ${height}`,
      },
      cls: ["line"],
    });
    const rec = createText({
      text: `0-0`,
      attr: {
        "font-size": 30,
        x: x - 40,
        y: 22,
        "alignment-baseline": "middle",
        "text-anchor": "end",
      },
    });
    grp.append(rec, line);
  });
};

const toLossSlot = (slot) => {
  const boxHeight = slot.getBBox().height;
  const scale = 0.75;
  const yShift = 0.5 * (1 - scale) * boxHeight;
  slot
    .querySelector("rect")
    .setAttribute("transform", `translate(0, ${yShift}) scale(1,${scale})`);
};

const get_record = (grp) => {
  const win = grp.querySelectorAll(`[data-result="win"]`).length;
  const loss = grp.querySelectorAll(`[data-result="loss"]`).length;
  return { win, loss };
};

const update_records = (svg) => {
  const { win, loss } = get_record(svg.querySelector("#results"));
  svg.querySelector("#teamRecord text").textContent = `${win}-${loss}`;

  svg.querySelectorAll(`[data-division]`).forEach((grp) => {
    const { win, loss } = get_record(grp);
    grp.querySelector("text").textContent = `${win}-${loss}`;
  });
};

const add_divider = (svg) => {
  const xShift = [...svg.querySelectorAll(`[data-result]`)]
    .slice(0, 2)
    .map((slot) =>
      Object.assign(
        {},
        { width: slot.getBBox().width },
        { x: slot.dataset.x, y: slot.dataset.y }
      )
    )
    .reduce((a, c) => {
      return Number(c.x) - Number(a.x) - a.width;
    });
  [...svg.querySelectorAll(`[data-result="win"]+[data-result="loss"]`)].forEach(
    (lossSlot) => {
      const winSlot = lossSlot.previousElementSibling;
      const { width, height } = winSlot.getBBox();
      const [x, y] = ["x", "y"].map((prop) => Number(winSlot.dataset[prop]));
      const c = createCircle({
        attr: {
          cx: 2 + x + width + xShift * 0.5,
          cy: y + 0.5 * height,
          r: xShift * 0.2,
        },
        cls: ["divider"],
      });
      lossSlot.parentNode.insertBefore(c, lossSlot);
    }
  );
};

const load_season = async (season, results) => {
  if (["2018", "2019", "2020", "2021"].includes(`${season}`)) {
    return new Promise((resolve, reject) => {
      resolve(gamelogs[`${season}`]);
    });
  } else if (results) {
    return new Promise((resolve, reject) => {
      resolve(results);
    });
  } else {
    const resultsurl = `./mlb${season}.json`;
    const results = await (
      await fetch(resultsurl, { cache: "no-cache" })
    ).json();
    return results;
  }
};

const update_location = (params) => {
  const url = new URL(window.location);
  const team = params.team || url.searchParams.get("team") || "ANGELS";
  const season = params.season || url.searchParams.get("season") || "2022";

  url.searchParams.set("team", team);
  url.searchParams.set("season", season);
  window.history.pushState(null, "", url);
};

const svgdownload = (svg) => () => {
  const delay = (msec) => new Promise((r) => setTimeout(r, msec));

  const team = svg.querySelector(`[data-team]`).dataset.team.replace(" ", "");
  const record = svg.querySelector("#teamRecord text").textContent;
  const season = svg.querySelector("#title text").dataset.season;
  const filename = `${season}-${team.toLowerCase()}-${record}.png`;

  const svgData = new XMLSerializer().serializeToString(svg);

  const canvas = document.createElement("canvas");
  //svg.parentNode.append(canvas);
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

class H2hCanvas extends HTMLElement {
  static get observedAttributes() {
    return ["season", "team"];
  }

  constructor() {
    super();
  }

  render() {
    const styleColors = `<style>
    :host,
    :root {
      --angels-red: #ba0021;
      --angels-blue: #003263;
      --angels-maroon: #862633;
      --angels-silver: #C4CED4;
      --athletics-green: #006141;
      --athletics-darkgreen: #003831;
      --athletics-gold: #EFB21E;
      --athletics-gray: #A2AAAD;
      --athletics-yellow: #FFCD00;

      --astros-orange: #eb6e1f;
      --astros-darkblue: #002d62;
      --mariners-green: #005c5c;
      --mariners-navy: #0c2c56;
      --mariners-aqua: #6ec2c4;
      --mariners-red: #D50032;
      --rangers-red: #c0111f;
      --rangers-blue: #003278;
      --rangers-white: white;
    
      --dodger-blue: #005a9c;
      --dodger-red: #EF3E42;
      --dodger-silver: #A5ACAF;
      --giants-orange: #fd5a1e;
      --giants-black: #27251F;
      --giants-beige: #EFD19F;
      --giants-gold: #AE8F6F;
      --padres-brown: #2F241D;
      --padres-gold: #ffc425;
      --padres-blue: #002D62;
      --padres-gray: #A2AAAD;
      --rockies-purple: #33006f;
      --rockies-silver: #C4CED4;
      --rockies-black: #000000;
      --dbacks-red: #a71930;
      --dbacks-sand: #e3d4ad;
      --dbacks-black: black;
    
      --orioles-orange: #df4601;
      --orioles-black: black;
      --redsox-red: #bd3039;
      --redsox-blue: #0c2340;
      --yankees-blue: #003087;
      --yankees-red: #e4002c;
      --yankees-navy: #0c2340;
      --yankees-gray: #c4ced3;
      --rays-navy: #092c5c;
      --rays-columbia-blue: #8FBCE6;
      --bluejays-blue: #134A8E;
      --bluejays-navy: #1D2D5C;
      --bluejays-red: #E8291C;
      --bluejays-white: white;
      --bluejays-powderblue: #6ba9dc;
    
      --phillies-red: #E81828;
      --phillies-blue: #002D72;
      --phillies-white: white;
      --nationals-red: #AB0003;
      --nationals-blue: #14225A;
      --nationals-white: white;
      --mets-blue: #002D72;
      --mets-orange: #FF5910;
      --braves-scarlet: #CE1141;
      --braves-navy: #13274F;
      --marlins-miamiblue: #00A3E0;
      --marlins-red: #EF3340;
      --marlins-black: black;
    
      --cubs-blue: #0E3386;
      --cubs-red: #CC3433;
      --reds-red: #C6011F;
      --reds-black: black;
      --guardians-navy: #00385D;
      --guardians-red: #E50022;
      --tigers-navy: #0C2340;
      --tigers-orange: #FA4616;
      --tigers-white: white;
      --royals-blue: #004687;
      --royals-gold: #BD9B60;
    
      --brewers-yellow: #FFC52F;
      --brewers-navy: #12284B;
      --cardinals-red: #C41E3A;
      --cardinals-navy: #0C2340;
      --cardinals-yellow: #FEDB00;
      --cardinals-lightblue: #add8e6;
      --pirates-black: #27251F;
      --pirates-gold: #FDB827;
      --twins-navy: #002B5C;
      --twins-scarlet-red: #D31145;
      --whitesox-black: #27251F;
      --whitesox-silver: #C4CED4;
    }
    </style>`;
    const styleSvg = `<style>
    .bgRect {
      stroke: none;
      fill: var(--bg-color, cornsilk);
    }
    
    [data-winner="ANGELS"] {
      --team-color: var(--angels-red);
      --win-stroke-color: var(--angels-blue);
    }
    
    [data-winner="ASTROS"] {
      --team-color: var(--astros-orange);
      --win-stroke-color: var(--astros-darkblue);
    }
    
    [data-winner="RANGERS"] {
      --team-color: var(--rangers-blue);
      --win-stroke-color: var(--rangers-red);
    }
    
    [data-winner="MARINERS"] {
      --team-color: var(--mariners-aqua);
      --win-stroke-color: var(--mariners-navy);
    }
    
    [data-winner="ATHLETICS"] {
      --team-color: var(--athletics-green);
      --win-stroke-color: var(--athletics-gold);
      --stroke-color: var(--athletics-green);
    }
    
    [data-winner="INDIANS"],
    [data-winner="GUARDIANS"] {
      --team-color: var(--guardians-red);
      --win-stroke-color: var(--guardians-navy);
    }
    
    [data-winner="TIGERS"] {
      --team-color: var(--tigers-navy);
      --win-stroke-color: var(--tigers-navy);
    }
    
    [data-winner="TWINS"] {
      --team-color: var(--twins-navy);
      --win-stroke-color: var(--twins-scarlet-red);
    }
    
    [data-winner="ROYALS"] {
      --team-color: var(--royals-blue);
      --win-stroke-color: var(--royals-gold);
    }
    
    [data-winner="WHITE SOX"] {
      --team-color: var(--whitesox-silver);
      --win-stroke-color: var(--whitesox-black);
    }
    
    [data-winner="RAYS"] {
      --team-color: var(--rays-navy);
      --win-stroke-color: var(--rays-columbia-blue);
    }
    
    [data-winner="BLUE JAYS"] {
      --team-color: var(--bluejays-powderblue);
      --win-stroke-color: var(--bluejays-blue);
    }
    
    [data-winner="RED SOX"] {
      --team-color: var(--redsox-red);
      --win-stroke-color: var(--redsox-blue);
    }
    
    [data-winner="YANKEES"] {
      --team-color: var(--yankees-gray);
      --win-stroke-color: var(--yankees-blue);
    }
    
    [data-winner="ORIOLES"] {
      --team-color: var(--orioles-orange);
      --win-stroke-color: var(--orioles-black);
    }
    
    [data-winner="DIAMONDBACKS"] {
      --team-color: var(--dbacks-red);
      --win-stroke-color: var(--dbacks-black);
    }
    
    [data-winner="DODGERS"] {
      --team-color: var(--dodger-blue);
      --win-stroke-color: var(--dodger-blue);
    }
    
    [data-winner="PADRES"] {
      --team-color: var(--padres-gold);
      --win-stroke-color: var(--padres-brown);
    }
    
    [data-winner="ROCKIES"] {
      --team-color: var(--rockies-silver);
      --win-stroke-color: var(--rockies-purple);
    }
    
    [data-winner="GIANTS"] {
      --team-color: var(--giants-orange);
      --win-stroke-color: var(--giants-black);
    }
    
    [data-winner="REDS"] {
      --team-color: var(--reds-red);
      --win-stroke-color: var(--reds-black);
    }
    
    [data-winner="CUBS"] {
      --team-color: var(--cubs-blue);
      --win-stroke-color: var(--cubs-red);
    }
    
    [data-winner="CARDINALS"] {
      --team-color: var(--cardinals-red);
      --win-stroke-color: var(--cardinals-navy);
    }
    
    [data-winner="PIRATES"] {
      --team-color: var(--pirates-gold);
      --win-stroke-color: var(--pirates-black);
    }
    
    [data-winner="BREWERS"] {
      --team-color: var(--brewers-navy);
      --win-stroke-color: var(--brewers-yellow);
      --stroke-color: var(--brewers-navy);
    }
    
    [data-winner="BRAVES"] {
      --team-color: var(--braves-scarlet);
      --win-stroke-color: var(--bluejays-navy);
    }
    
    [data-winner="METS"] {
      --team-color: var(--mets-orange);
      --win-stroke-color: var(--mets-blue);
    }
    
    [data-winner="NATIONALS"] {
      --team-color: var(--nationals-red);
      --win-stroke-color: var(--nationals-blue);
    }
    
    [data-winner="PHILLIES"] {
      --team-color: var(--phillies-red);
      --win-stroke-color: var(--phillies-blue);
    }
    
    [data-winner="MARLINS"] {
      --team-color: var(--marlins-black);
      --win-stroke-color: var(--marlins-miamiblue);
    }
    
    [data-result] {
      fill: var(--team-color);
    }
    
    [data-result="togo"] {
      fill: none;
      stroke-width: 2;
      stroke: var(--win-stroke-color, var(--togo-color));
    }
    
    [data-result="win"] {
      stroke-width: 6;
      stroke: var(--win-stroke-color, var(--team-color));
    }
    
    [data-result="loss"] {
      stroke-width: 2;
      stroke: var(--bg-color);
    }
    
    text {
      font-family: Arial, Helvetica, sans-serif
    }
    
    .line {
      fill: none;
      stroke-width: 4;
      stroke: var(--stroke-color, var(--win-stroke-color, var(--team-color, black)));
    }
    
    .divider {
      fill: var(--win-stroke-color, black);
      stroke: none;
    }
    </style>`;
    const styleHtml = `<style>
:host {
  background-color: var(--bg-color);
  display: flex;
  place-content: center;
}
svg {
  width: min(100vw, 0.75 * var(--canvas-height, 20%));
  display: block;
  margin:  auto;
}
    </style>`;
    const html = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1600">
    ${styleColors}
    ${styleSvg}
    <rect x="0" y="0" width="1200" height="1600" class="bgRect"></rect>
    <g id="results"></g>
    <g id="teamLogo" transform="translate(24,1248)"></g>
    <g id="teamRecord" transform="translate(144,1546)">
      <text x="0" y="0" font-size="60" alignment-baseline="middle" text-anchor="middle" class="record">0-0</text>
    </g>
    <g id="title">
      <text x="600" y="48" alignment-baseline="middle" text-anchor="middle" font-size="40">2022 Head-to-Head Results</text>
    </g>
  </svg>
    `;
    const shadow = this.attachShadow({ mode: "open" });
    shadow.innerHTML = `${styleHtml}${html}`;
    this.svg = this.shadowRoot.querySelector("svg");
    this.draw(this.season, this.team);
    window.svgdownload = svgdownload(this.svg);
  }

  apply_results(results) {
    const svg = this.svg;
    const team = svg.querySelector("#results").dataset.team;

    results
      .filter((o) => o.status?.includes("FINAL"))
      .map(createGameResult)
      .filter(team_selector(team))
      .forEach((game) => {
        const opp = [game.winner, game.loser].filter((t) => t !== team)[0];
        const slots = [
          ...svg.querySelectorAll(`[data-team="${opp}"] g`),
        ].filter((g) => g.dataset.result === "togo");
        if (game.winner === team) {
          const slot = slots[0];
          if (slot) {
            slot.dataset.result = "win";
            slot.dataset.winner = team;
            slot.dataset.date = `${game.date}`;
          }
        } else if (game.loser === team) {
          const slot = slots.slice(-1)[0];
          if (slot) {
            slot.dataset.result = "loss";
            slot.dataset.winner = opp;
            slot.dataset.date = `${game.date}`;
            toLossSlot(slot);
          }
        }

        update_records(svg);
        add_divider(svg);
      });
  }

  draw_slots(results) {
    const svg = this.svg;
    const team = svg.querySelector("#results").dataset.team;
    const matchups = get_matchups(results);

    const numberOfMatches = get_number_of_matches(team)(matchups);
    const opponents = numberOfMatches.map((o) => o.opponent);
    const grpByDivision = get_group_by_division(numberOfMatches);

    const data = opponents
      .map((opp) => {
        // by division, by City
        const t = mlbteams.find((o) => o.nickname.toUpperCase() === opp);
        const div = `${t.league} ${t.division}`;
        const c1 = grpByDivision.find((o) => o.division === div).num;
        const c2 = divisions.findIndex((d) => d.division === div);
        const c3 =
          30 - mlbteams.findIndex((o) => o.nickname.toUpperCase() === opp);
        const order = Number(
          [c1, c2, c3].map((n) => n.toString().padStart(3, "0")).join("")
        );
        return {
          team: opp,
          order,
        };
      })
      .sort((a, b) => b.order - a.order)
      .map(({ team }) => {
        return {
          team,
          num: numberOfMatches.find((o) => o.opponent === team).num,
        };
      });
    //console.log(data);

    const divGroups = data
      .map((obj) => mlbteams.find((t) => t.nickname.toUpperCase() === obj.team))
      .map((t) => `${t.league} ${t.division}`)
      .reduce(uniq)
      .map((division) => {
        const gDivisions = createGroup({
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
            ].map((z, i, ary) => {
              const { x, y } = getXY(i + 1, ary.length, box);
              const grp = createGroup({
                attr: {
                  transform: `translate(${x},${y})`,
                },
                dataset: {
                  num: i + 1,
                  result: "togo",
                  x,
                  y,
                },
              });

              grp.append(slotRect.cloneNode(true));
              return grp;
            });
            grp.append(...slots);
            return grp;
          });
        gDivisions.append(...rows);
        return gDivisions;
      });

    svg.querySelector("#results").append(...divGroups);

    align_rows_in_divisions(svg);
    align_division_group(svg);
    align_results_group(svg);

    const season = this.season;
    add_logos_of_opponents(svg, get_logos(season));
    add_records_against_each_division(svg);

    return results;
  }

  draw(season, team) {
    if (!(season && team)) return;

    const svg = this.svg;

    empty_results_group(svg, team);
    add_team_logo(svg, get_logos(season)[team]);
    update_title(svg, season);

    load_season(this.season, this.results)
      .then((results) => this.draw_slots(results))
      .then((results) => this.apply_results(results));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue === newValue) return;
    if (name === "season") {
      const season = newValue;
      this.teams = get_teams(season);
      if (oldValue === "2022" && this.team === "GUARDIANS") {
        this.team = "INDIANS";
        update_location({ season, team: this.team });
      } else if (newValue === "2022" && this.team === "INDIANS") {
        this.team = "GUARDIANS";
        update_location({ season, team: this.team });
      } else {
        update_location({ season });
      }
      this.season = season;
    } else if (name === "team") {
      this.team = newValue;
      update_location({ team: newValue });
    }
    if (this.season && this.team && this.svg) this.draw(this.season, this.team);
  }

  connectedCallback() {
    mlbteams.push({
      code: "CLE",
      league: "AL",
      division: "Central",
      nickname: "Indians",
      hashtag: "#ForTheLand",
      name: "Cleaveland Indians",
    });
    mlbteams.sort((a, b) => {
      if (a.name > b.name) return 1;
      if (a.name < b.name) return -1;
      return 0;
    });
    if (!this.result) {
      load_season("2022").then((results) => (this.results = results));
    }
    this.render();
  }
}

export { H2hCanvas };
