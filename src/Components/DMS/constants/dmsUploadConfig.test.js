import test from "node:test";
import assert from "node:assert/strict";

import {
  DMS_MAX_UPLOAD_BYTES,
  formatFileSize,
  validateDmsFiles,
  getFileConfig,
  FILE_TYPE_CONFIG,
  STATUS_CONFIG,
  getStatusConfig,
  DMS_PERMISSION_NAMES,
  DMS_FOLDER_PERMISSION,
} from "./dmsUploadConfig.js";

test("DMS Upload Configuration & Multi-Format Engine (DMS-01)", async (t) => {
  await t.test("DMS_MAX_UPLOAD_BYTES allows up to 100MB", () => {
    assert.equal(DMS_MAX_UPLOAD_BYTES, 100 * 1024 * 1024);
    assert.equal(DMS_MAX_UPLOAD_BYTES, 104857600);
  });

  await t.test("formatFileSize formats bytes cleanly across ranges", () => {
    assert.equal(formatFileSize(0), "0 B");
    assert.equal(formatFileSize(-100), "0 B");
    assert.equal(formatFileSize("invalid"), "0 B");
    assert.equal(formatFileSize(512), "512 B");
    assert.equal(formatFileSize(1024), "1.0 KB");
    assert.equal(formatFileSize(1536), "1.5 KB");
    assert.equal(formatFileSize(1024 * 1024), "1.0 MB");
    assert.equal(formatFileSize(50 * 1024 * 1024), "50.0 MB");
    assert.equal(formatFileSize(100 * 1024 * 1024), "100.0 MB");
  });

  await t.test("validateDmsFiles validates empty file lists safely", () => {
    const resEmpty = validateDmsFiles([]);
    assert.equal(resEmpty.isValid, false);
    assert.equal(resEmpty.error, "NO_FILES");
    assert.deepEqual(resEmpty.oversizedFiles, []);

    const resNull = validateDmsFiles(null);
    assert.equal(resNull.isValid, false);
    assert.equal(resNull.error, "NO_FILES");
  });

  await t.test("validateDmsFiles accepts files at or below 100MB limit", () => {
    const validFiles = [
      { name: "contract.pdf", size: 2 * 1024 * 1024 },
      { name: "dataset.xlsx", size: 15 * 1024 * 1024 },
      { name: "presentation.pptx", size: 45 * 1024 * 1024 },
      { name: "backup.zip", size: 100 * 1024 * 1024 }, // exactly 100MB
    ];

    const result = validateDmsFiles(validFiles);
    assert.equal(result.isValid, true);
    assert.equal(result.error, null);
    assert.equal(result.validFiles.length, 4);
    assert.equal(result.oversizedFiles.length, 0);
  });

  await t.test("validateDmsFiles flags oversized files exceeding 100MB limit", () => {
    const mixedFiles = [
      { name: "small.pdf", size: 1024 * 1024 },
      { name: "huge_video.mp4", size: 100 * 1024 * 1024 + 1 }, // 100MB + 1 byte
      { name: "giant_archive.zip", size: 150 * 1024 * 1024 },
    ];

    const result = validateDmsFiles(mixedFiles);
    assert.equal(result.isValid, false);
    assert.equal(result.error, "FILE_TOO_LARGE");
    assert.equal(result.validFiles.length, 1);
    assert.equal(result.oversizedFiles.length, 2);
    assert.equal(result.oversizedFiles[0].name, "huge_video.mp4");
    assert.equal(result.oversizedFiles[1].name, "giant_archive.zip");
  });

  await t.test("getFileConfig resolves colors and backgrounds for multi-format extensions", () => {
    const pdf = getFileConfig("pdf");
    assert.equal(pdf.color, "#e74c3c");

    const docx = getFileConfig(".docx");
    assert.equal(docx.color, "#2980b9");

    const xlsx = getFileConfig("XLSX");
    assert.equal(xlsx.color, "#27ae60");

    const pptx = getFileConfig("pptx");
    assert.equal(pptx.color, "#e67e22");

    const zip = getFileConfig("zip");
    assert.equal(zip.color, "#d35400");

    const png = getFileConfig(".png");
    assert.equal(png.color, "#00838f");

    const mp4 = getFileConfig("mp4");
    assert.equal(mp4.color, "#c0392b");

    // Unknown extension fallback
    const unknown = getFileConfig("xyz123");
    assert.equal(unknown.color, "#546e7a");
    assert.equal(unknown.bg, "#f0f3f4");
  });

  await t.test("getStatusConfig and permission constants are properly structured", () => {
    assert.ok(getStatusConfig("Completed"));
    assert.ok(getStatusConfig("Pending"));
    assert.ok(getStatusConfig("Draft"));
    assert.ok(getStatusConfig("Declined"));

    assert.equal(DMS_PERMISSION_NAMES.View, "View");
    assert.equal(DMS_PERMISSION_NAMES.FullControl, "FullControl");
    assert.equal(DMS_FOLDER_PERMISSION.FullControl, 5);
  });
});
