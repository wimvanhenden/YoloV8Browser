// JavaScript Revealing Module Pattern
const tImage = (function () {
  // Private Properties
  let image = null;
  let canvas = null;
  let ctx = null;

  async function publicInit() {
    image = document.getElementById('test_image');
    canvas = document.getElementById('image_canvas');
    ctx = canvas.getContext('2d');

    canvas.width = image.videoWidth;
    canvas.height = image.videoHeight;
  }

  function publicGetImage() {
    return image;
  }

  function publicGetCanvas() {
    return canvas;
  }

  function publicGetContext() {
    return ctx;
  }

  /**
   * Reveal public pointers to 
   * private functions and properties
   */
  return {
    doInit: publicInit,
    getImage: publicGetImage,
    getCanvas: publicGetCanvas,
    getContext: publicGetContext
  }
})();

export { tImage };