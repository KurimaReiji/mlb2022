const mlbteams = [
  {
    "code": "HOU",
    "league": "AL",
    "division": "West",
    "nickname": "Astros",
    "hashtag": "#LevelUp",
    "name": "Houston Astros"
  },
  {
    "code": "TEX",
    "league": "AL",
    "division": "West",
    "nickname": "Rangers",
    "hashtag": "#StraightUpTX",
    "name": "Texas Rangers"
  },
  {
    "code": "LAA",
    "league": "AL",
    "division": "West",
    "nickname": "Angels",
    "hashtag": "#GoHalos",
    "name": "Los Angeles Angels"
  },
  {
    "code": "SEA",
    "league": "AL",
    "division": "West",
    "nickname": "Mariners",
    "hashtag": "#SeaUsRise",
    "name": "Seattle Mariners"
  },
  {
    "code": "OAK",
    "league": "AL",
    "division": "West",
    "nickname": "Athletics",
    "hashtag": "#DrumTogether",
    "name": "Oakland Athletics"
  },
  {
    "code": "TBR",
    "league": "AL",
    "division": "East",
    "nickname": "Rays",
    "hashtag": "#RaysUp",
    "name": "Tampa Bay Rays"
  },
  {
    "code": "BOS",
    "league": "AL",
    "division": "East",
    "nickname": "Red Sox",
    "hashtag": "#DirtyWater",
    "name": "Boston Red Sox"
  },
  {
    "code": "NYY",
    "league": "AL",
    "division": "East",
    "nickname": "Yankees",
    "hashtag": "#RepBX",
    "name": "New York Yankees"
  },
  {
    "code": "TOR",
    "league": "AL",
    "division": "East",
    "nickname": "Blue Jays",
    "hashtag": "#NextLevel",
    "name": "Toronto Blue Jays"
  },
  {
    "code": "BAL",
    "league": "AL",
    "division": "East",
    "nickname": "Orioles",
    "hashtag": "#Birdland",
    "name": "Baltimore Orioles"
  },
  {
    "code": "MIN",
    "league": "AL",
    "division": "Central",
    "nickname": "Twins",
    "hashtag": "#MNTwins",
    "name": "Minnesota Twins"
  },
  {
    "code": "CLE",
    "league": "AL",
    "division": "Central",
    "nickname": "Guardians",
    "hashtag": "#ForTheLand",
    "name": "Cleaveland Guardians"
  },
  {
    "code": "CWS",
    "league": "AL",
    "division": "Central",
    "nickname": "White Sox",
    "hashtag": "#Changethegame",
    "name": "Chicago White Sox"
  },
  {
    "code": "DET",
    "league": "AL",
    "division": "Central",
    "nickname": "Tigers",
    "hashtag": "#DetroitRoots",
    "name": "Detroit Tigers"
  },
  {
    "code": "KCR",
    "league": "AL",
    "division": "Central",
    "nickname": "Royals",
    "hashtag": "#TogetherRoyal",
    "name": "Kansas City Royals"
  },
  {
    "code": "ATL",
    "league": "NL",
    "division": "East",
    "nickname": "Braves",
    "hashtag": "#ForTheA",
    "name": "Atlanta Braves"
  },
  {
    "code": "NYM",
    "league": "NL",
    "division": "East",
    "nickname": "Mets",
    "hashtag": "#LGM",
    "name": "New York Mets"
  },
  {
    "code": "PHI",
    "league": "NL",
    "division": "East",
    "nickname": "Phillies",
    "hashtag": "#RingTheBell",
    "name": "Philadelphia Phillies"
  },
  {
    "code": "MIA",
    "league": "NL",
    "division": "East",
    "nickname": "Marlins",
    "hashtag": "#MakeItMiami",
    "name": "Miami Marlins"
  },
  {
    "code": "WSH",
    "league": "NL",
    "division": "East",
    "nickname": "Nationals",
    "hashtag": "#Natitude",
    "name": "Washington Nationals"
  },
  {
    "code": "STL",
    "league": "NL",
    "division": "Central",
    "nickname": "Cardinals",
    "hashtag": "#STLCards",
    "name": "St. Louis Cardinals"
  },
  {
    "code": "MIL",
    "league": "NL",
    "division": "Central",
    "nickname": "Brewers",
    "hashtag": "#ThisIsMyCrew",
    "name": "Milwaukee Brewers"
  },
  {
    "code": "PIT",
    "league": "NL",
    "division": "Central",
    "nickname": "Pirates",
    "hashtag": "#LetsGoBucs",
    "name": "Pittsburgh Pirates"
  },
  {
    "code": "CHC",
    "league": "NL",
    "division": "Central",
    "nickname": "Cubs",
    "hashtag": "#ItsDifferentHere",
    "name": "Chicago Cubs"
  },
  {
    "code": "CIN",
    "league": "NL",
    "division": "Central",
    "nickname": "Reds",
    "hashtag": "#ATOBTTR",
    "name": "Cincinatti Reds"
  },
  {
    "code": "LAD",
    "league": "NL",
    "division": "West",
    "nickname": "Dodgers",
    "hashtag": "#AlwaysLA",
    "name": "Los Angeles Dodgers"
  },
  {
    "code": "SDP",
    "league": "NL",
    "division": "West",
    "nickname": "Padres",
    "hashtag": "#TimeToShine",
    "name": "San Diego Padres"
  },
  {
    "code": "SFG",
    "league": "NL",
    "division": "West",
    "nickname": "Giants",
    "hashtag": "#SFGameUp",
    "name": "San Francisco Giants"
  },
  {
    "code": "ARI",
    "league": "NL",
    "division": "West",
    "nickname": "Diamondbacks",
    "hashtag": "#Dbacks",
    "name": "Arizona Diamondbacks"
  },
  {
    "code": "COL",
    "league": "NL",
    "division": "West",
    "nickname": "Rockies",
    "hashtag": "#Rockies",
    "name": "Colorado Rockies"
  }
];

const divisions = [
  { division: "AL East", teams: ["TBR", "BOS", "NYY", "TOR", "BAL"] },
  { division: "AL Central", teams: ["CWS", "DET", "CLE", "KCR", "MIN"] },
  { division: "AL West", teams: ["LAA", "HOU", "TEX", "OAK", "SEA"] },
  { division: "NL East", teams: ["ATL", "NYM", "PHI", "MIA", "WSH"] },
  { division: "NL Central", teams: ["STL", "MIL", "PIT", "CHC", "CIN"] },
  { division: "NL West", teams: ["LAD", "SDP", "SFG", "ARI", "COL"] },
];

const createGameResult = (obj) => {
  const score = obj.score.split("-").map((s) => Number(s));
  const home = { team: obj.home, score: score[0] };
  const road = { team: obj.road, score: score[1] };
  const sign = Math.sign(score[0] - score[1]);
  const winner = [road.team, "Tied", home.team][sign + 1];
  const loser = [home.team, "Tied", road.team][sign + 1];
  return Object.assign({}, obj, {
    date: obj.date,
    home,
    road,
    winner,
    loser,
  });
};

const team_selector = (team) => (game) =>
  [game.home, game.road].map((t) => t.team).includes(team);

const teams_by_wpct = (a, b) => {
  const [aWpct, bWpct] = [a, b].map((obj) => obj.win / (obj.win + obj.loss));
  if (aWpct > bWpct) return -1;
  if (aWpct < bWpct) return 1;
  if (a.win > b.win) return -1;
  if (a.win < b.win) return 1;
  return 0;
};

export {
  mlbteams,
  divisions,
  createGameResult,
  team_selector,
  teams_by_wpct,
};