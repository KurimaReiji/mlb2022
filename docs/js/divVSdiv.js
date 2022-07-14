import { mlbteams, createGameResult, team_selector } from "./mlb2022.js";

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

const wpct = (win, loss) => {
  const val = Number(win) / (Number(win) + Number(loss));
  return isNaN(val) ? "" : val.toFixed(3).replace(/^0/, "");
};

const byWpct = (a, b) => {
  const [aa, bb] = [a, b].map((ary) => ary[0].querySelector("td:nth-of-type(2)"))
    .map((td) => { return { win: td.dataset.win, loss: td.dataset.loss } })
    ;
  if (wpct(aa.win, aa.loss) < wpct(bb.win, bb.loss)) return 1;
  if (wpct(aa.win, aa.loss) > wpct(bb.win, bb.loss)) return -1;
  if (aa.win < bb.win) return 1;
  if (aa.win > bb.win) return -1;
  return 0;

}

const find_team = (team) => (db) => {
  return db.find((o) => o.nickname.toUpperCase() === team);
}

const url = `./mlb2022.json`;
const inputs = await (await fetch(url, { cache: "no-cache" })).json();
const games = inputs.map(createGameResult).map((obj) => {
  const winner = find_team(obj.winner)(mlbteams);
  const loser = find_team(obj.loser)(mlbteams);
  return Object.assign(obj, {
    winner,
    loser,
    w_division: `${winner.league} ${winner.division}`,
    l_division: `${loser.league} ${loser.division}`,
  });
});
console.log(games[0]);

const divisions = [
  "AL East",
  "AL Central",
  "AL West",
  "NL East",
  "NL Central",
  "NL West",
];
const to_uniq = (acc, cur, idx, ary) => {
  if (idx == ary.length - 1) acc = [...new Set(ary)];
  return acc;
};
const opponent = (team) => (g) => {
  if (g) return team.toUpperCase() == g.home.team.toUpperCase() ? g.road.team.toUpperCase() : g.home.team.toUpperCase();
  return "off";
};
const head2head = (team) => (games) => {
  const me = mlbteams.find((t) => t.nickname.toUpperCase() === team.toUpperCase());
  const myDivision = `${me.league} ${me.division}`;
  const myGames = games.filter(team_selector(team.toUpperCase()));
  const opponents = myGames.map((game) => opponent(team)(game)).reduce(to_uniq);
  const data = opponents
    .map((opp) => {
      const vsGames = myGames.filter((g) => opponent(team)(g) == opp);
      const opTeam = mlbteams.find((t) => t.nickname.toUpperCase() === opp);
      return {
        me: team,
        opponent: opp,
        myDivision,
        opDivision: `${opTeam.league} ${opTeam.division}`,
        win: vsGames.filter((g) => g.winner.nickname == team).length,
        loss: vsGames.filter((g) => g.loser.nickname == team).length,
      };
    });

  return data;
}

//console.log(head2head("Yankees")(games));

const data = mlbteams.map((obj) => obj.nickname)
  .map((t) => head2head(t)(games))
  .flat();

console.log(data.slice(-3));
const table = createElement("table")({});
const thead = createElement("thead")({});
const tbody = createElement("tbody")({});

const htr = createElement("tr")({});
const ths = divisions.map((d) => createElement("th")({ text: d }));
htr.append(
  createElement("th")({ text: "Division" }),
  createElement("th")({ text: "Total" }),
  createElement("th")({ text: "Others" }),
  ...ths
);
thead.append(htr);

const get_records = (ary) => {
  return {
    win: ary.reduce((a, c) => a + c.win, 0),
    loss: ary.reduce((a, c) => a + c.loss, 0),
  }
}
const divRows = divisions.map((d) => {
  const tr = createElement("tr")({});
  const name = createElement("td")({
    text: d,
  });
  const targets = data.filter((o) => d === o.myDivision);
  const record = get_records(targets);
  const total = createElement("td")({
    text: `${record.win}-${record.loss}`,
    dataset: {
      win: record.win,
      loss: record.loss,
    }
  });
  const vsOthers = targets.filter((o) => d !== o.opDivision);
  const othersRecord = get_records(vsOthers);
  const others = createElement("td")({
    text: `${othersRecord.win}-${othersRecord.loss}`,
    dataset: {
      win: othersRecord.win,
      loss: othersRecord.loss,
    }
  });

  const tds = divisions.map((op) => {
    const targets = data.filter((o) => d === o.myDivision && op === o.opDivision);
    const record = get_records(targets);

    const td = createElement("td")({
      text: `${record.win}-${record.loss}`,
      dataset: {
        win: record.win,
        loss: record.loss,
      }
    });
    return td;
  });
  tr.append(name, total, others, ...tds);

  const tr2 = createElement("tr")({});
  [...tr.querySelectorAll("td")].forEach((td0) => {
    let text = "";
    let above500 = "";
    if (td0.dataset.win) {
      text = wpct(td0.dataset.win, td0.dataset.loss);
      above500 = text >= .5 ? "above" : "below";
    }
    const td = createElement("td")({
      text: text,
      dataset: {
        above500,
      }
    });
    tr2.append(td);
  });

  const teams = mlbteams.filter((t) => `${t.league} ${t.division}` === d)
    .map((team) => {
      const tr = createElement("tr")({});
      const name = createElement("td")({
        text: team.nickname,
      });
      const targets = data.filter((o) => team.nickname === o.me);
      const record = get_records(targets);
      const total = createElement("td")({
        text: `${record.win}-${record.loss}`,
        dataset: {
          win: record.win,
          loss: record.loss,
        }
      });

      const vsOthers = targets.filter((o) => d !== o.opDivision);
      const othersRecord = get_records(vsOthers);
      const others = createElement("td")({
        text: `${othersRecord.win}-${othersRecord.loss}`,
        dataset: {
          win: othersRecord.win,
          loss: othersRecord.loss,
        }
      });

      const tds = divisions.map((op) => {
        const targets = data.filter((o) => team.nickname === o.me && op === o.opDivision);
        const record = get_records(targets);

        const td = createElement("td")({
          text: `${record.win}-${record.loss}`,
          dataset: {
            win: record.win,
            loss: record.loss,
          }
        });
        return td;
      });

      tr.append(name, total, others, ...tds);

      const tr2 = createElement("tr")({});
      [...tr.querySelectorAll("td")].forEach((td0) => {
        let text = "";
        let above500 = "";
        if (td0.dataset.win) {
          text = wpct(td0.dataset.win, td0.dataset.loss);
          above500 = text >= .5 ? "above" : "below";
        }
        const td = createElement("td")({
          text: text,
          dataset: {
            above500,
          }
        });
        tr2.append(td);
      })
      return [tr, tr2];
    }).sort(byWpct)
    .flat()

  return [tr, tr2, ...teams];
}).flat();
/* const trs = divisions.map((d) => {
  const tr = createElement("tr")({});

  const name = createElement("td")({
    text: d,
  });
  const total_win = data
    .filter((o) => o.division === d)
    .reduce((a, c) => a + c.win, 0);
  const total_loss = data
    .filter((o) => o.division === d)
    .reduce((a, c) => a + c.loss, 0);
  const total = createElement("td")({
    text: `${total_win}-${total_loss}`,
  });

  const win = data
    .filter((o) => o.division === d && o.division === o.opponent)
    .reduce((a, c) => a + c.win, 0);
  const loss = data
    .filter((o) => o.division === d && o.division === o.opponent)
    .reduce((a, c) => a + c.loss, 0);
  const others = createElement("td")({
    text: `${total_win - win}-${total_loss - loss}`,
  });
  const tds = divisions.map((op) => {
    const obj = data.find((o) => o.division === d && o.opponent === op);
    const td = createElement("td")({
      text: `${obj.win}-${obj.loss}`,
    });
    return td;
  });
  tr.append(name, total, others, ...tds);

  const tr2 = createElement("tr")({});
  const tds2 = [...tr.querySelectorAll("td")].map((td0) => {
    const td = createElement("td")({});
    if (td0.textContent.includes("-")) {
      const [w, l] = td0.textContent.split("-").map((s) => Number(s));
      td.textContent = wpct(w, l);
    }
    return td;
  });
  tr2.append(...tds2);

  const teams = mlbteams.filter((t) => t.league === divisions.slice(0, 3))
    .map((t) => {
      const tr = createElement("tr")(({}));
      const h2h = head2head(t.nickname)(games);
      const tds = divisions.map((op) => {
        const obj = h2h.find((o) => o.division === d && o.opponent === op);
        const td = createElement("td")({
          text: `${obj.win}-${obj.loss}`,
        });
        return td;
      });
      tr.append(...tds);
      return tr;
    });

  return [tr, tr2, ...teams];
});
tbody.append(...trs.flat());
 */
tbody.append(...divRows);
table.append(thead, tbody);

document.querySelector(".container").append(table);

/* 
AL East v AL East 87 games
bal 15
bos 11
nyy 28
tb  17
tor 16

AL East v NL 48 games 28-20
4-1
5-5
10-6
4-4
5-4
*/
