const fs = require("fs");
const path = require("path");

const src = path.resolve(__dirname);
const dest = path.resolve(__dirname, "build");

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    const stat = fs.lstatSync(full);
    if (stat.isDirectory()) rimraf(full);
    else fs.unlinkSync(full);
  }
  fs.rmdirSync(dir);
}

function copyRecursive(srcDir, destDir) {
  if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
  for (const name of fs.readdirSync(srcDir)) {
    if (name === "node_modules" || name === "build" || name.startsWith(".git")) continue;
    const from = path.join(srcDir, name);
    const to = path.join(destDir, name);
    const stat = fs.lstatSync(from);
    if (stat.isDirectory()) copyRecursive(from, to);
    else fs.copyFileSync(from, to);
  }
}

rimraf(dest);
copyRecursive(src, dest);
console.log("✅ Frontend build created at", dest);