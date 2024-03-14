import { tImage } from "./tImage";
import { tWebcam } from "./tWebcam";
import {tTFJSDetector} from "./tfjs/tTFJSDetector"
//import {tTFJSDetector} from "./tfjs/tTFJSDetector_2"
//import {tONNXDetector} from "./onnx/tONNXDetector"

console.log("START");
await tWebcam.doInit();
console.log("WEBCAM INIT DONE");

await tImage.doInit();


//await tONNXDetector.doInit();
//console.log("ONNX INIT DONE");

await tTFJSDetector.doInit();
console.log("TFJS INIT DONE");

async function doTFJSDetection() {
    await tTFJSDetector.doDetection(tImage.getImage(), tImage.getCanvas());
    //await tTFJSDetector.doDetection(tWebcam.getVideo(), tWebcam.getCanvas());
    //await tTFJSDetector.doDetection(tWebcam.getVideo());
    //console.log(tTFJSDetector.getOutPut().boxes[0])
}
const intervalID = setInterval(doTFJSDetection, 33);