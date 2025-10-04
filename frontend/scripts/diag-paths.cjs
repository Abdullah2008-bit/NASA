// Temporary diagnostic to output directory structure for Vercel build
const fs = require("fs");
const path = require("path");

function list(dir, depth = 0) {
  if (depth > 4) return; // limit
  let entries = [];
  try {
    entries = fs.readdirSync(dir);
  } catch {
    return;
  }
  for (const e of entries) {
    const full = path.join(dir, e);
    let stat;
    try {
      stat = fs.statSync(full);
    } catch {
      continue;
    }
    console.log(
      `${" ".repeat(depth * 2)}- ${full.replace(process.cwd() + path.sep, "")}${
        stat.isDirectory() ? "/" : ""
      }`
    );
    if (stat.isDirectory()) list(full, depth + 1);
  }
}

console.log("=== DIAG: process.cwd()", process.cwd());
console.log("=== DIAG: Listing key paths");
["src/lib", "src/hooks", "src/components/ui"].forEach((p) => {
  const full = path.join(process.cwd(), p);
  console.log(`\n[Check] ${full}`);
  if (fs.existsSync(full)) {
    console.log("Exists");
    list(full);
  } else {
    console.log("MISSING");
  }
});
