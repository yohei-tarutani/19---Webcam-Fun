//  Selects the <video> element that will display the webcam feed.
const video = document.querySelector(".player");
// Selects the <canvas> element where video frames will be drawn.
const canvas = document.querySelector(".photo");
// Gets the 2D drawing context of the canvas (getContext("2d")) to manipulate images.
const ctx = canvas.getContext("2d");
// Selects the <div class="strip">, where captured photos will be displayed.
const strip = document.querySelector(".strip");
// Selects the <audio class="snap"> element, which will play a sound effect when taking a photo.
const snap = document.querySelector(".snap");

// Getting the Webcam Video Feed
function getVideo() {
  // Requests access to the user's webcam (video: true) but disables audio (audio: false).
  navigator.mediaDevices
    .getUserMedia({ video: true, audio: false })
    // If the user grants access,
    .then((localMediaStream) => {
      console.log(localMediaStream);
      // MediaStream {id: '3c48954a-c8b0-4760-be19-7ce1fd410991', active: true, onaddtrack: null, onremovetrack: null, onactive: null, …}

      // Assigns the webcam stream (localMediaStream) to video.srcObject, making the video element display the live feed.
      video.srcObject = localMediaStream;
      video.play(); // Calls video.play() to start the video.
    })
    .catch((err) => {
      console.error("Oh No!!", err);
    });
}

// Drawing the Video onto the Canvas
function paintToCanvas() {
  // Gets the width & height of the video feed and sets the canvas size accordingly.
  const width = video.videoWidth;
  const height = video.videoHeight;
  console.log(width, height); // ex. 640 480
  canvas.width = width;
  canvas.height = height;

  // Every 16ms,
  setInterval(() => {
    // Draws the current video frame onto the canvas using ctx.drawImage(video, 0, 0, width, height).
    // Extracts pixel data using ctx.getImageData(0, 0, width, height).
    ctx.drawImage(video, 0, 0, width, height);
    // takes the pixels out
    let pixels = ctx.getImageData(0, 0, width, height);

    // mess with the pixels
    // pixels = redEffect(pixels);
    // pixels = rgbSplit(pixels); // ghost like effect 1
    // ctx.globalAlpha = 0.4; // ghost like effect 2
    pixels = greenScreen(pixels); // Applies a filter (greenScreen(), which removes a color range).

    // put the pixels back
    ctx.putImageData(pixels, 0, 0); // Updates the canvas with the processed image.
  }, 16);
}

function takePhoto() {
  // play the sound
  snap.currentTime = 0; // reset sound effect
  snap.play(); // play shutter sound

  // take the data out of the canvas
  const data = canvas.toDataURL("image/jpeg"); // Convert canvas to an image URL
  const link = document.createElement("a"); // Create a new <a> tag
  link.href = data; // Set the download link to the image
  link.setAttribute("download", "handsome"); // Set download file name
  link.innerHTML = `<img src=${data} alt="Handsome Man"/>`; // Show image preview
  strip.insertBefore(link, strip.firstChild); // Add the new photo to the top of the strip
}

// Red Effect Filter
function redEffect(pixels) {
  // pixels.data is the array that contains Red (R), Green (G), Blue (B), Alpha (A) values for each pixel. Modifies each pixel.
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i + 0] = pixels.data[i + 0] + 100; // red
    pixels.data[i + 1] = pixels.data[i + 1] + -50; // green
    pixels.data[i + 2] = pixels.data[i + 2] * 0.5; // blue
  }
  return pixels;
}

// Offsets the Red, Green, and Blue channels in different directions, creating a "ghosting" effect.
function rgbSplit(pixels) {
  for (let i = 0; i < pixels.data.length; i += 4) {
    pixels.data[i - 150] = pixels.data[i + 0]; // red
    pixels.data[i + 500] = pixels.data[i + 1]; // green
    pixels.data[i - 550] = pixels.data[i + 2]; // blue
  }
  return pixels;
}

// Green Screen Effect
function greenScreen(pixels) {
  const levels = {};

  // Gets RGB filter values from the <input> sliders, and assign them with the keys = input.name into the levels object.
  document.querySelectorAll(".rgb input").forEach((input) => {
    levels[input.name] = input.value;
  });

  // Loops through each pixel, checking if it's within the selected color range.
  for (i = 0; i < pixels.data.length; i = i + 4) {
    red = pixels.data[i + 0];
    green = pixels.data[i + 1];
    blue = pixels.data[i + 2];
    alpha = pixels.data[i + 3];

    // If inside the range, sets alpha = 0 (makes it transparent).
    if (
      red >= levels.rmin &&
      green >= levels.gmin &&
      blue >= levels.bmin &&
      red <= levels.rmax &&
      green <= levels.gmax &&
      blue <= levels.bmax
    ) {
      // take it out!
      pixels.data[i + 3] = 0;
    }
  }
  return pixels;
}

// Calls getVideo function to start the webcam
getVideo();

// Waits for the video to be playable (canplay event) and then calls paintToCanvas()
video.addEventListener("canplay", paintToCanvas);
