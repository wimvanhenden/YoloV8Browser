import { tWebcam } from "./tWebcam";
import {tTFJSDetector} from "./tfjs/tTFJSDetector"
import {tONNXDetector} from "./onnx/tONNXDetector"

console.log("START");
await tWebcam.doInit();
console.log("WEBCAM INIT DONE");
await tONNXDetector.doInit();
console.log("ONNX INIT DONE");



//await tTFJSDetector.doInit();
//console.log("TFJS INIT DONE");

//async function doDetection(a, b) {
//    await tTFJSDetector.doDetection(tWebcam.getVideo(), tWebcam.getCanvas());
//}

//const intervalID = setInterval(doDetection, 33);