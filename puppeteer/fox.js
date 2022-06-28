import { writeFileSync } from "fs";
import puppeteer from "puppeteer";

const scraper = (date = "2022-06-17") => {
  const d = date.split("-").join("");
  const today = document.getElementById(d);
  return [...today.querySelectorAll(`.score-chip.final`)]
    .map((chip) => {
      const rows = [...chip.querySelectorAll(".score-team-row")];
      const status = chip
        .querySelector(".score-game-info span")
        .textContent.trim();
      const [home, road] = rows.map((row) => {
        return {
          team: row.querySelector(".score-team-name span")?.textContent,
          score: row
            .querySelector(".score-team-score span")
            ?.textContent.trim(),
        };
      });
      return {
        date,
        home: home.team,
        road: road.team,
        score: `${home.score} - ${road.score}`,
        status,
      };
    })
    .filter((obj) => obj.status.includes("FINAL"));
};

const dates = process.argv.slice(2);
if (dates.length > 0 && dates.every((d) => /^202\d-[012]\d-[0-3]\d$/.test(d))) {
  console.log(dates);
} else {
  console.error("Usage: node fox.js YYYY-MM-DD");
  process.exit(1);
}

const browser = await puppeteer.launch({
  defaultViewport: {
    width: 1200,
    height: 1100,
  },
  headless: true,
});

const page = await browser.newPage();

for (const date of dates) {
  const targetURL = `https://www.foxsports.com/mlb/scores?date=${date}`;
  await page.goto(targetURL);
  console.log(targetURL);
  await page.waitForSelector(".score-chip.final");
  const data = await page.evaluate(scraper, date);
  const output = JSON.stringify(data, null, 2);
  console.log(output);
  const outfile = `./mlb-${date}.json`;
  writeFileSync(outfile, output, "utf8");
}

await browser.close();
