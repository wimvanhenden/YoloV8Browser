// JavaScript Revealing Module Pattern
const tWebcam = (function () {
  // Private Properties
  let video = null;
  let canvas = null;
  let ctx = null;

  async function initWebcam() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      video.srcObject = stream;

      return new Promise((resolve) => {
        video.onloadedmetadata = () => {
          // Now the video size can be accessed, and further actions can be enabled
          console.log('Video dimensions:', video.videoWidth, video.videoHeight);
          resolve();
        };
      });
    } catch (err) {
      console.error("Error accessing the webcam: ", err);
      alert('Unable to access the webcam. Please make sure you have given the necessary permissions.');
      throw err; // Rethrow the error if needed or handle it as per your application logic
    }
  }
  async function publicInit() {
    video = document.getElementById('webcam');
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');

    await initWebcam();
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  function publicGetVideo() {
    return video;
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
    getVideo: publicGetVideo,
    getCanvas: publicGetCanvas,
    getContext: publicGetContext
  }
})();

export { tWebcam };