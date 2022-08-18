import { readFileSync } from "fs";

const jsonfile = "../docs/mlb2022-results.json";
const results = JSON.parse(readFileSync(jsonfile, "utf8"));

const season_matchups = JSON.parse(readFileSync("../docs/mlb2022-matchups.json", "utf8"));

const matchups = results
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

// seasonMatchups との差分を試合予定として追加する。
const data = season_matchups
  //.filter((o) => o.home === "ANGELS" || o.road === "ANGELS")
  .map((o) => {
    const r = matchups.find(
      (obj) => o.home === obj.home && o.road === obj.road
    );
    const done = r?.num || 0;
    const remaining = o.num - done;
    return Object.assign({}, o, { done, remaining });
  });

const remaining = data
  .filter((o) => o.remaining > 0)
  .map((o) => {
    const obj = {
      home: o.home,
      road: o.road,
    };
    return [...new Array(o.remaining)].map((item) => obj);
  })
  .flat();

const games = results.concat(remaining);
const output = JSON.stringify(games, null, 2);
console.log(output);
