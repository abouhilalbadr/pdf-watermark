const { rgb, degrees, StandardFonts } = require('pdf-lib')

// const getFont = require('./getFont')

const hexToRgb = (hex) => {
  const validHex = /^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)
  if(!validHex) return
  let c = hex.substring(1).split('');
  if(c.length === 3) {
    c = [c[0], c[0], c[1], c[1], c[2], c[2]];
  }
  c = '0x' + c.join('');
  return rgb((c>>16)&255, (c>>8)&255, c&255);
}

const watermarkText = async (pdfDoc, settings) => {
  /*================================================================
    settings => text, font, size, rotate, opacity, position, layout, color
  ================================================================*/
  const fontFamily = await pdfDoc.embedFont(StandardFonts[settings.font])

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    const page = pdfDoc.getPage(i)
    const isLandscape = pdfDoc.getPage(i).getRotation().angle === 90
    const rgbValue = hexToRgb(settings.color)
    console.log(rgbValue);
    page.drawText(settings.text, {
      x: isLandscape ? page.getWidth() : 0,
      y: 0,
      size: parseInt(settings.size),
      font: fontFamily,
      opacity: parseFloat(settings.opacity),
      color: rgbValue,
      rotate: degrees(parseInt(settings.rotate)),
    })
  }

  return await pdfDoc.save()
}

const watermarkImage = async (pdfDoc, settings) => {
  /*================================================================
    settings => rotate, opacity, position, layout
  ================================================================*/

  for (let i = 0; i < pdfDoc.getPageCount(); i++) {
    let isLandscape = pdfDoc.getPage(i).getRotation().angle === 90
    let page = pdfDoc.getPage(i)
    page.drawImage(addWatermarkPDFImage, {
      x: isLandscape ? page.getWidth() : 0,
      y: 0,
      width: isLandscape ? page.getHeight() : page.getWidth(),
      height: isLandscape ? page.getWidth() : page.getHeight(),
      opacity: parseFloat(settings.opacity),
      rotate: degrees(parseInt(settings.rotate)),
    })
  }

  return await pdfDoc.save()
}

module.exports = { watermarkText, watermarkImage }