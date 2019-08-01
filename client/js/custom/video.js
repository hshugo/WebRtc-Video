var imageNr = 0; // Serial number of current image
var finished = new Array(); // References to img objects which have finished downloading
var paused = false;
var ip_video = 'http://192.168.0.138:8080';

function createImageLayer() {
  var img = new Image();
  img.style.zIndex = -1;
  img.style.position = "absolute";
  img.style.top ="20px";
  img.style.marginLeft ="10px";
  img.onload = imageOnload;
  img.onclick = imageOnclick;
  img.src = null;
  img.src = ip_video + '/?action=snapshot&n=' + (++imageNr);
  var webcam = document.getElementById("webcam");
  webcam.insertBefore(img, webcam.firstChild);

}

// Two layers are always present (except at the very beginning), to avoid flicker
function imageOnload() {
  this.style.zIndex = (imageNr%3); // Image finished, bring to front!
  while (1 < finished.length) {
    var del = finished.shift(); // Delete old image(s) from document
    del.parentNode.removeChild(del);
  }
  finished.push(this);
  if (!paused) createImageLayer();
}

function imageOnclick() { // Clicking on the image will pause the stream
  paused = !paused;
  if (!paused) createImageLayer();
}
