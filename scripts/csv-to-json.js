// data/restaurants.csv 를 읽어 public/data/restaurants.json 으로 바꾼다.
// 실행: node scripts/csv-to-json.js [입력.csv] [출력.json]
// 필요한 열만 남긴다: id, name, area, category, hours. 전화번호 같은 개인정보 열은 버린다.
const fs = require("fs");
const path = require("path");

const input = process.argv[2] || path.join(__dirname, "..", "data", "restaurants.csv");
const output = process.argv[3] || path.join(__dirname, "..", "public", "data", "restaurants.json");
const KEEP = ["id", "name", "area", "category", "hours"];
const PERSONAL = ["phone", "tel", "owner", "email", "전화번호", "대표자"];

function parseLine(line) {
  const cells = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (quoted && line[i + 1] === '"') { cur += '"'; i++; } else { quoted = !quoted; }
    } else if (ch === "," && !quoted) {
      cells.push(cur); cur = "";
    } else {
      cur += ch;
    }
  }
  cells.push(cur);
  return cells;
}

const lines = fs.readFileSync(input, "utf8").replace(/^﻿/, "").split(/\r?\n/).filter((l) => l.trim() !== "");
const header = parseLine(lines[0]).map((h) => h.trim());
const dropped = header.filter((h) => PERSONAL.includes(h.toLowerCase()));
const missing = KEEP.filter((k) => !header.includes(k));
if (missing.length) {
  console.error("필요한 열이 없습니다: " + missing.join(", "));
  process.exit(1);
}
const rows = lines.slice(1).map((l) => {
  const cells = parseLine(l);
  const obj = {};
  for (const k of KEEP) obj[k] = (cells[header.indexOf(k)] || "").trim();
  return obj;
});

fs.mkdirSync(path.dirname(output), { recursive: true });
fs.writeFileSync(output, JSON.stringify(rows, null, 2) + "\n");

const byArea = {};
for (const r of rows) byArea[r.area] = (byArea[r.area] || 0) + 1;
console.log("CSV 데이터 줄 수: " + (lines.length - 1));
console.log("JSON 건수: " + rows.length);
console.log("동네별 건수: " + JSON.stringify(byArea));
if (dropped.length) console.log("개인정보로 보여 버린 열: " + dropped.join(", "));
