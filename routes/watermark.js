const fs = require("fs")
const path = require("path")
const { PDFDocument } = require("pdf-lib")
const fetch = require("cross-fetch")

const { watermarkText, watermarkImage } = require('./helpers/index')

const addWatermark = async (req, res) => {
  const { pdfType, watermarkType } = req.body
  const settings = JSON.parse(req.body.settings)
  try {
    let addWatermarkPDFDoc, resultFile
    // Check the PDF file (url OR upload)
    if (pdfType === 'url') {
      // Fetch the url file
      addWatermarkPDFDoc = await fetch(settings.pdfUrl).then(res => res.arrayBuffer())
    }
    else {
      // Load the uploaded file
      addWatermarkPDFDoc = await PDFDocument.load(
        "data:application/pdf;base64," + req.file.buffer.toString("base64")
      )
    }
    // Check if watermark text OR image
    if (watermarkType === 'text') {
      // Prepare the watermark settings
      const textSettings = {
        text: settings.text,
        font: settings.font,
        size: settings.size,
        color: settings.color,
        rotate: settings.rotate,
        opacity: settings.opacity,
        // layout: '', // need to change
        // position: '' //  need to change
      }
      // Load and change the PDF file
      resultFile = await watermarkText(addWatermarkPDFDoc, textSettings)
    }
    else {
      let imageWatermark
      if (settings.imageType === 'url')
        imageWatermark = await fetch(settings.image).then((res) => res.arrayBuffer())
      else
        imageWatermark = settings.image
      // Prepare the watermark settings
      const imageSettings = {
        image: imageWatermark,
        rotate: settings.rotate,
        opacity: settings.opacity,
        layout: '', //  need to change
        position: '', //  need to change
      }
      // Load and change the PDF file
      resultFile = await watermarkImage(addWatermarkPDFDoc, imageSettings)
    }
    // Load previous PDF document and add first page
    const addPagePDFDoc = await PDFDocument.load(resultFile)
    // Remove First page if it's required
    if (settings.firstPage) addPagePDFDoc.removePage(0)
    let setPagePDFImage
    // Check if the fist page image from url or buffer
    if (settings.firstPageType === 'url')
      setPagePDFImage = await fetch(settings.firstPageImage).then((res) => res.arrayBuffer())
    else
      setPagePDFImage = settings.firstPageImage
    // Embed the first page image
    const addPagePDFImage = await addPagePDFDoc.embedPng(setPagePDFImage)
    // Insert the first page image in the first page of the PDF
    const addPagePDFImagePage = addPagePDFDoc.insertPage(
      0,
      addPagePDFDoc.getPage(0).getRotation().angle === 90
        ? [
            addPagePDFDoc.getPage(0).getHeight(),
            addPagePDFDoc.getPage(0).getWidth(),
          ]
        : undefined
    )
    addPagePDFImagePage.drawImage(addPagePDFImage, {
      x: 0,
      y: 0,
      width: addPagePDFImagePage.getWidth(),
      height: addPagePDFImagePage.getHeight(),
    });
    // Save a new PDF file with the changes
    const newFilePath = `${path.basename(req.file.originalname, ".pdf")}-easywatermark.pdf`
    res.status(200)
    res.setHeader("Content-Type", "application/pdf")
    res.setHeader("Content-Disposition", "attachment; filename=" + newFilePath)
    res.send(Buffer.from((await addPagePDFDoc.save()).buffer, "binary"))
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message || 'Error from API');
  }
}

module.exports = addWatermark