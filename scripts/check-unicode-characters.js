#!/usr/bin/env node

/**
 * Unicode Character Scanner
 * Detects invisible and problematic Unicode characters in filenames and file contents
 * Helps prevent build failures caused by hidden characters
 */

const fs = require("fs");
const path = require("path");

const PROBLEMATIC_UNICODE = {
  "\u200B": { name: "ZERO WIDTH SPACE", code: "U+200B", danger: "high" },
  "\u200C": { name: "ZERO WIDTH NON-JOINER", code: "U+200C", danger: "high" },
  "\u200D": { name: "ZERO WIDTH JOINER", code: "U+200D", danger: "high" },
  "\u2060": { name: "WORD JOINER", code: "U+2060", danger: "critical" },
  "\uFEFF": { name: "ZERO WIDTH NO-BREAK SPACE", code: "U+FEFF", danger: "high" },
  "\u061C": { name: "ARABIC LETTER MARK", code: "U+061C", danger: "medium" },
  "\u202A": { name: "LEFT-TO-RIGHT EMBEDDING", code: "U+202A", danger: "medium" },
  "\u202B": { name: "RIGHT-TO-LEFT EMBEDDING", code: "U+202B", danger: "medium" },
  "\u202C": { name: "POP DIRECTIONAL FORMATTING", code: "U+202C", danger: "medium" },
  "\u202D": { name: "LEFT-TO-RIGHT OVERRIDE", code: "U+202D", danger: "medium" },
  "\u202E": { name: "RIGHT-TO-LEFT OVERRIDE", code: "U+202E", danger: "medium" },
};

const COMPONENT_DIRS = ["app/components", "src/components", "components"];
const EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".css"];

function scanDirectory(dir) {
  const results = {
    filenameFindingsare: [],
    contentFindings: [],
    summary: {},
  };

  if (!fs.existsSync(dir)) {
    console.log(`Directory not found: ${dir}`);
    return results;
  }

  function walk(currentPath) {
    const files = fs.readdirSync(currentPath);

    files.forEach((file) => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile()) {
        const ext = path.extname(file);
        if (EXTENSIONS.includes(ext)) {
          // Check filename
          checkFilename(file, fullPath, results);
          // Check file contents
          checkFileContents(fullPath, results);
        }
      }
    });
  }

  walk(dir);
  return results;
}

function checkFilename(filename, fullPath, results) {
  for (const [char, info] of Object.entries(PROBLEMATIC_UNICODE)) {
    if (filename.includes(char)) {
      results.filenameFindings.push({
        file: fullPath,
        filename: filename,
        character: info.name,
        code: info.code,
        danger: info.danger,
        position: filename.indexOf(char),
        display: `"${filename.split(char).join(`[${info.code}]`)}"`,
      });

      if (!results.summary[info.code]) {
        results.summary[info.code] = 0;
      }
      results.summary[info.code]++;
    }
  }
}

function checkFileContents(filePath, results) {
  try {
    const content = fs.readFileSync(filePath, "utf8");

    for (const [char, info] of Object.entries(PROBLEMATIC_UNICODE)) {
      if (content.includes(char)) {
        const lines = content.split("\n");
        lines.forEach((line, index) => {
          if (line.includes(char)) {
            results.contentFindings.push({
              file: filePath,
              line: index + 1,
              character: info.name,
              code: info.code,
              danger: info.danger,
              linePreview: line.substring(0, 100),
            });

            if (!results.summary[info.code]) {
              results.summary[info.code] = 0;
            }
            results.summary[info.code]++;
          }
        });
      }
    }
  } catch (err) {
    console.error(`Error reading file ${filePath}:`, err.message);
  }
}

// Main execution
console.log("🔍 Scanning for hidden Unicode characters...\n");

let allResults = {
  filenameFindings: [],
  contentFindings: [],
  summary: {},
};

COMPONENT_DIRS.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`📂 Scanning: ${dir}`);
    const results = scanDirectory(dir);

    allResults.filenameFindings.push(...results.filenameFindings);
    allResults.contentFindings.push(...results.contentFindings);

    Object.entries(results.summary).forEach(([code, count]) => {
      allResults.summary[code] = (allResults.summary[code] || 0) + count;
    });
  }
});

// Report findings
if (allResults.filenameFindings.length > 0) {
  console.log("\n⚠️  FILENAME ISSUES FOUND:");
  allResults.filenameFindings.forEach((finding) => {
    console.log(`\n  📄 ${finding.file}`);
    console.log(`     Character: ${finding.character} (${finding.code})`);
    console.log(`     Display: ${finding.display}`);
    console.log(`     Risk: ${finding.danger.toUpperCase()}`);
  });
}

if (allResults.contentFindings.length > 0) {
  console.log("\n⚠️  CONTENT ISSUES FOUND:");
  allResults.contentFindings.forEach((finding) => {
    console.log(`\n  📝 ${finding.file}:${finding.line}`);
    console.log(`     Character: ${finding.character} (${finding.code})`);
    console.log(`     Line: ${finding.linePreview}...`);
    console.log(`     Risk: ${finding.danger.toUpperCase()}`);
  });
}

if (
  allResults.filenameFindings.length === 0 &&
  allResults.contentFindings.length === 0
) {
  console.log("✅ No problematic Unicode characters detected!");
} else {
  console.log("\n📊 SUMMARY:");
  console.log(`   Total findings: ${allResults.filenameFindings.length + allResults.contentFindings.length}`);
  console.log("   Character breakdown:");
  Object.entries(allResults.summary).forEach(([code, count]) => {
    const info =
      Object.values(PROBLEMATIC_UNICODE).find((i) => i.code === code) || {};
    console.log(`     ${code} (${info.name}): ${count} occurrence(s)`);
  });
}

process.exit(
  allResults.filenameFindings.length > 0 ||
  allResults.contentFindings.length > 0
    ? 1
    : 0
);
