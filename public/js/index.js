// global Declarition
window.MY_PDF = {
  file: null,
  pdfType: null,
  watermarkType: null,
  settings: {}
}
/*=============================
  Donation Button
=============================*/
const donateBtn = document.getElementById('donateBtn')
donateBtn.onclick = () => {
  fetch('/donate', {
    method: 'POST'
  })
  .then(response => response.json())
  .then(data => console.log(data));
}

/*=============================
  Drag & Drop file
=============================*/
document.querySelectorAll(".drop-zone__input").forEach((inputElement) => {
  const dropZoneElement = inputElement.closest(".drop-zone");

  dropZoneElement.addEventListener("click", (e) => {
    inputElement.click();
  });

  inputElement.addEventListener("change", (e) => {
    if (inputElement.files.length) {
      updateThumbnail(dropZoneElement, inputElement.files[0]);
    }
  });

  dropZoneElement.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropZoneElement.classList.add("drop-zone--over");
  });

  ["dragleave", "dragend"].forEach((type) => {
    dropZoneElement.addEventListener(type, (e) => {
      dropZoneElement.classList.remove("drop-zone--over");
    });
  });

  dropZoneElement.addEventListener("drop", (e) => {
    e.preventDefault();

    if (e.dataTransfer.files.length) {
      inputElement.files = e.dataTransfer.files;
      updateThumbnail(dropZoneElement, e.dataTransfer.files[0]);
    }

    dropZoneElement.classList.remove("drop-zone--over");
  });
});
/**
 * Updates the thumbnail on a drop zone element.
 *
 * @param {HTMLElement} dropZoneElement
 * @param {File} file
 */
const updateThumbnail = (dropZoneElement, file) => {
  let thumbnailElement = dropZoneElement.querySelector(".drop-zone__thumb");

  // First time - remove the prompt
  if (dropZoneElement.querySelector(".drop-zone__prompt")) {
    dropZoneElement.querySelector(".drop-zone__prompt").remove();
  }

  // First time - there is no thumbnail element, so lets create it
  if (!thumbnailElement) {
    thumbnailElement = document.createElement("div");
    thumbnailElement.classList.add("drop-zone__thumb");
    dropZoneElement.appendChild(thumbnailElement);
  }

  thumbnailElement.dataset.label = file.name;
}

/*=============================
  Stepper
=============================*/
const nextStep = document.getElementById('nextStep')
const prevStep = document.getElementById('prevStep')
const currentStep = document.getElementById('currentStep')

/**
 * Add Disabled class to the buttons.
 *
 */
 const addDisabled = () => {
  if (parseInt(currentStep.dataset.currentStep) === 1) {
    prevStep.classList.add('disabled')
  }
  else if (parseInt(currentStep.dataset.currentStep) === 4) {
    nextStep.classList.add('disabled')
  }
  else {
    prevStep.classList.remove('disabled')
    nextStep.classList.remove('disabled')
  }
}

// Run on the start
addDisabled()
// Next Step
nextStep.onclick = () => {
  let oldStep = parseInt(currentStep.dataset.currentStep)
  if (validateSteps(oldStep)) {
    // Collect Data from Inputs
    collectData(oldStep)
    // Send Data to the API
    if (oldStep === 3)
      sendFile()
    // Stop if no more step available
    if (oldStep >= 4) return
    // Update the current step
    setCurrentStep(oldStep, 'next')
    currentStep.dataset.currentStep = oldStep + 1
    addDisabled()
  }

}
// Prev Step
prevStep.onclick = () => {
  let oldStep = parseInt(currentStep.dataset.currentStep)
  if (oldStep <= 1) return
  setCurrentStep(oldStep, 'prev')
  currentStep.dataset.currentStep = oldStep - 1
  addDisabled()
}
/**
 * Updates the Step on the stepper.
 *
 * @param {Number} oldStep
 * @param {String} action
 */
const setCurrentStep = (oldStep, action) => {
  const stepper = document.querySelectorAll('.stepper')
  const wrapper = document.querySelectorAll('.wrapper')
  const line = document.querySelectorAll('.line')
  stepper.forEach((e, i) => {
    const step = parseInt(e.dataset.step)
    if (step === oldStep)
      e.classList.add('hidden')
    if (action === 'next') {
      if (step === oldStep + 1) {
        e.classList.remove('hidden')
        wrapper[i].classList.remove('text-gray-400')
        wrapper[i].classList.add('text-main')
        wrapper[i].children[0].classList.remove('border-gray-400')
        wrapper[i].children[0].classList.add('border-main')
        if (step < 4) {
          line[i].classList.remove('border-gray-400')
          line[i].classList.add('border-main')
        }
      }
    }
    else {
      if (step === oldStep - 1) {
        e.classList.remove('hidden')
        wrapper[i + 1].classList.remove('text-main')
        wrapper[i + 1].classList.add('text-gray-400')
        wrapper[i + 1].children[0].classList.remove('border-main')
        wrapper[i + 1].children[0].classList.add('border-gray-400')
        if (step > 0 && step < 3) {
          line[i + 1].classList.remove('border-main')
          line[i + 1].classList.add('border-gray-400')
        }
      }
    }
  })
}

/*=============================
  Watermark Types
=============================*/
const typeText = document.getElementById('type-text')
const typeImage = document.getElementById('type-image')
const watermarkText = document.getElementById('watermark-text')
const watermarkImage = document.getElementById('watermark-image')

typeText.onclick = () => {
  typeImage.classList.remove('checked')
  typeText.classList.add('checked')
  watermarkText.classList.remove('hidden')
  watermarkImage.classList.add('hidden')
}
typeImage.onclick = () => {
  typeText.classList.remove('checked')
  typeImage.classList.add('checked')
  watermarkImage.classList.remove('hidden')
  watermarkText.classList.add('hidden')
}

/*=============================
  First page Settings
=============================*/
const firstpageBtn = document.getElementById('firstpageBtn')
const firstpageDetails = document.getElementById('firstpageDetails')

firstpageBtn.onclick = () => {
  firstpageBtn.classList.add('hidden')
  firstpageDetails.classList.remove('hidden')
}

/*=============================
  Validate Steps
=============================*/
const validateSteps = (step) => {
  if (step === 1) {
    const pdfFile = document.getElementById('pdf-file')
    const pdfUrl = document.getElementById('pdf-url')
    const pdfValidation = document.getElementById('pdf-validation')
    // validate PDF file or URL
    if (pdfFile.files.length > 0 || pdfUrl.value) {
      pdfValidation.classList.add('hidden')
      return true
    }
    else {
      pdfValidation.classList.remove('hidden')
      return false
    }
  }
  else if (step === 2) {
    const btnType = document.querySelectorAll('.btnType.checked')
    if (btnType.length > 0) {
      const watermarkId = btnType[0].getAttribute('id')
      const watermarkValidation = document.getElementById('watermark-validation')
      // Check watermark type for validate the text value or image
      if (watermarkId === 'type-text') {
        // Validate the watermark Text
        const watermarkText = document.getElementById('watermark-value')
        // Validate text value
        if (watermarkText.value) {
          watermarkValidation.classList.add('hidden')
          return true
        } else {
          watermarkValidation.classList.remove('hidden')
          return false
        }
      } else {
        // Validate the watermark Image
        const watermarkImg = document.getElementById('watermark-img')
        const watermarkUrl = document.getElementById('img-url')
        if (watermarkImg.files.length > 0 || watermarkUrl.value) {
          watermarkValidation.classList.add('hidden')
          return true
        }
        else {
          watermarkValidation.classList.remove('hidden')
          return false
        }
      }
    }
    return true
  }
  return true
}

/*=============================
  Collect Data
=============================*/

const toBase64 = file => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result);
  reader.onerror = error => reject(error);
})

const collectData = async (step) => {
  if (step === 1) {
    const pdfFile = document.getElementById('pdf-file')
    const pdfUrl = document.getElementById('pdf-url')

    if (pdfFile.files.length > 0) {
      window.MY_PDF.file = pdfFile.files[0]
      window.MY_PDF.pdfType = 'file'
    } else if (pdfUrl.value) {
      window.MY_PDF.settings.pdfUrl = pdfUrl.value
      window.MY_PDF.pdfType = 'url'
    }

  }
  else if (step === 2) {
    const btnType = document.querySelectorAll('.btnType.checked')
    const watermarkRotate = document.getElementById('watermark-rotation')
    const watermarkOpacity = document.getElementById('watermark-opacity')
    const watermarkLayout = document.getElementById('watermark-layout')
    const watermarkPosition = document.getElementById('watermark-position')

    if (btnType.length > 0) {
      const watermarkId = btnType[0].getAttribute('id')
      if (watermarkId === 'type-text') {
        // Collect Watermark Text Settings
        const watermarkText = document.getElementById('watermark-value')
        const watermarkFont = document.getElementById('watermark-font')
        const watermarkSize = document.getElementById('watermark-size')
        const watermarkColor = document.getElementById('watermark-color')
        console.log(watermarkColor.value);
        window.MY_PDF.watermarkType = 'text'
        window.MY_PDF.settings.text = watermarkText.value || ''
        window.MY_PDF.settings.font = watermarkFont.value || 'Helvetica'
        window.MY_PDF.settings.size = watermarkSize.value || 24
        window.MY_PDF.settings.color = watermarkColor.value || '#000000'
      }
      else {
        // Collect Watermark Image
        window.MY_PDF.watermarkType = 'image'

        const watermarkImg = document.getElementById('watermark-img')
        const watermarkImgUrl = document.getElementById('img-url')

        if (watermarkImg.files.length > 0) {
          // Change Image to base64 buffer
          const imageBuffer = await toBase64(watermarkImg.files[0])
          window.MY_PDF.settings.image = imageBuffer
        } else if (watermarkImgUrl.value) {
          window.MY_PDF.settings.image = watermarkImgUrl.value
        }
      }

      // Collect Watermark Other Settings
      window.MY_PDF.settings.rotate = watermarkRotate.value || 0
      window.MY_PDF.settings.opacity = watermarkOpacity.value || 100
      window.MY_PDF.settings.layout = watermarkLayout.value || 'Above'
      window.MY_PDF.settings.position = watermarkPosition.value || 'TopLeft'

    }
  }
  else if (step === 3) {
    const firstpageBtn = document.getElementById('firstpageBtn')
    if (firstpageBtn.classList.contains('hidden')) {
      const deleteFirstpage = document.getElementById('delete-firstpage')
      const firstpageImg = document.getElementById('firstpage-img')
      const firstpageImgUrl = document.getElementById('firstpage-url')

      window.MY_PDF.settings.firstPage = deleteFirstpage.checked || false

      if (firstpageImg.files.length > 0) {
        // Change Image to base64 buffer
        const imageBuffer = await toBase64(firstpageImg.files[0])
        window.MY_PDF.settings.firstPageType = 'image'
        window.MY_PDF.settings.firstPageImage = imageBuffer
      } else if (firstpageImgUrl.value) {
        window.MY_PDF.settings.firstPageType = 'url'
        window.MY_PDF.settings.firstPageImage = firstpageImgUrl.value
      }
    }
  }
}

/*=============================
  Send Data to the Server
=============================*/
const sendFile = () => {
  console.log(window.MY_PDF.settings);
  const formData = new FormData()
  formData.append('file', window.MY_PDF.file)
  formData.append('pdfType', window.MY_PDF.pdfType)
  formData.append('watermarkType', window.MY_PDF.watermarkType)
  formData.append('settings', JSON.stringify(window.MY_PDF.settings))
  fetch('/watermark', {
    method: 'POST',
    body: formData,
  })
  .then(response => response.json())
  .then(data => console.log(data));
}
