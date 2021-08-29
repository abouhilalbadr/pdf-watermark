"use strict";

const fs = require("fs");
const path = require("path");
const multer = require("multer");
const express = require("express");
var cors = require('cors');
const { PDFDocument } = require("pdf-lib");

const fetch = require("node-fetch");
const app = express();

app.use(cors());

const upload = multer({
  storage: multer.memoryStorage({
    destination: function (req, file, callback) {
      callback(null, "");
    },
  }),
});

// Load the PDF assets
// Add your watermark images URL Here
const watermarkPortraitPng = '';
const watermarkLandscapePng = '';
const introPortraitPng = '';
const introLandscapePng = '';

app.post("/addwatermark", upload.single("file"), async (req, res) => {
  try {
    const watermarkPortrait = await fetch(watermarkPortraitPng).then((res) => res.arrayBuffer());
    const watermarkLandscape = await fetch(watermarkLandscapePng).then((res) => res.arrayBuffer());
    const introPortrait = await fetch(introPortraitPng).then((res) => res.arrayBuffer());
    const introLandscape = await fetch(introLandscapePng).then((res) => res.arrayBuffer());
    // Load PDF document and setup watermark
    const addWatermarkPDFDoc = await PDFDocument.load(
      "data:application/pdf;base64," + req.file.buffer.toString("base64")
    );
    const addWatermarkPDFImage = await addWatermarkPDFDoc.embedPng(
      addWatermarkPDFDoc.getPage(0).getRotation().angle === 90
        ? watermarkLandscape
        : watermarkPortrait
    );

    for (let i = 0; i < addWatermarkPDFDoc.getPageCount(); i++) {
      let isLandscape = addWatermarkPDFDoc.getPage(i).getRotation().angle === 90;
      let imagePage = addWatermarkPDFDoc.getPage(i);
      imagePage.drawImage(addWatermarkPDFImage, {
        x: isLandscape ? imagePage.getWidth() : 0,
        y: 0,
        width: isLandscape ? imagePage.getHeight() : imagePage.getWidth(),
        height: isLandscape ? imagePage.getWidth() : imagePage.getHeight(),
        opacity: 0.5,
        rotate: {
          type: imagePage.getRotation().type,
          angle: imagePage.getRotation().angle,
        },
      });
    }
    const pdfBytes = await addWatermarkPDFDoc.save();

    // Load previous PDF document and add first page
    const addPagePDFDoc = await PDFDocument.load(pdfBytes);
    // Remove First page if it's required
    if (req.body.firstPage && req.body.firstPage == 'true') {
      addPagePDFDoc.removePage(0);
    }
    const addPagePDFImage = await addPagePDFDoc.embedPng(
      addPagePDFDoc.getPage(0).getRotation().angle === 90
        ? introLandscape
        : introPortrait
    );
    const addPagePDFImagePage = addPagePDFDoc.insertPage(
      0,
      addPagePDFDoc.getPage(0).getRotation().angle === 90
        ? [
            addPagePDFDoc.getPage(0).getHeight(),
            addPagePDFDoc.getPage(0).getWidth(),
          ]
        : undefined
    );

    addPagePDFImagePage.drawImage(addPagePDFImage, {
      x: 0,
      y: 0,
      width: addPagePDFImagePage.getWidth(),
      height: addPagePDFImagePage.getHeight(),
    });

    const newFilePath = `${path.basename(req.file.originalname, ".pdf")}-result.pdf`;
    res.status(200);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=" + newFilePath);
    res.send(Buffer.from((await addPagePDFDoc.save()).buffer, "binary"));
  } catch (error) {
    res.status(404).send(error.message || 'Error from API');
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Listening on port ${ process.env.PORT || 5000 }`);
});
