import fs from "fs";
import path from "path";

const dir = "C:/Users/bilgi/.gemini/antigravity-ide/brain/2bf1ff98-8b14-4a5b-b082-14581993391f";
const targetDir = "c:/Projects/DrMars1/public/images";

const map = {
  "citrus-no-01.jpg": "dr_mars_citrus_bottle_1789566404493.jpg",
  "mineral-no-02.jpg": "dr_mars_mineral_bottle_1789566425961.jpg",
  "night-no-03.jpg": "dr_mars_night_bottle_1789566444011.jpg",
  "amber-no-04.jpg": "dr_mars_amber_bottle_1789566459380.jpg",
};

for (const [target, src] of Object.entries(map)) {
  const srcPath = path.join(dir, src);
  const destPath = path.join(targetDir, target);
  fs.copyFileSync(srcPath, destPath);
  console.log(`Copied ${src} to ${target}`);
}
