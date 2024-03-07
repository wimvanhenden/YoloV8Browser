//https://github.com/Hyuto/yolov8-tfjs
//https://github.com/tensorflow/tfjs?tab=readme-ov-file
//import * as tf from "@tensorflow/tfjs";
//import "@tensorflow/tfjs-backend-webgl"; // set backend to webgl
import labels from "./labels.json";
import { renderBoxes } from "./renderBox";


// JavaScript Revealing Module Pattern
const tTFJSDetector = (function () {
    // Private Properties
    let modelName = "yolov8n";
    let model = {
        net: null,
        inputShape: [1, 0, 0, 3],
    };
    
    let numClass = labels.length;

    let output = {
        boxes: null,
        scores: null,
        classes: null,
        ratios:[]

    }

    const preprocess = (source, modelWidth, modelHeight) => {
        let xRatio, yRatio; // ratios for boxes

        const input = tf.tidy(() => {
            const img = tf.browser.fromPixels(source);

            // padding image to square => [n, m] to [n, n], n > m
            const [h, w] = img.shape.slice(0, 2); // get source width and height
            const maxSize = Math.max(w, h); // get max size
            const imgPadded = img.pad([
                [0, maxSize - h], // padding y [bottom only]
                [0, maxSize - w], // padding x [right only]
                [0, 0],
            ]);

            xRatio = maxSize / w; // update xRatio
            yRatio = maxSize / h; // update yRatio

            return tf.image
                .resizeBilinear(imgPadded, [modelWidth, modelHeight]) // resize frame
                .div(255.0) // normalize
                .expandDims(0); // add batch
        });

        return [input, xRatio, yRatio];
    };


    async function  detect  (source, model, canvasRef) {
        const [modelWidth, modelHeight] = model.inputShape.slice(1, 3); // get model width and height
    
        tf.engine().startScope(); // start scoping tf engine
        const [input, xRatio, yRatio] = preprocess(source, modelWidth, modelHeight); // preprocess image
      
        const res = model.net.execute(input); // inference model
        const transRes = res.transpose([0, 2, 1]); // transpose result [b, det, n] => [b, n, det]
        const boxes = tf.tidy(() => {
          const w = transRes.slice([0, 0, 2], [-1, -1, 1]); // get width
          const h = transRes.slice([0, 0, 3], [-1, -1, 1]); // get height
          const x1 = tf.sub(transRes.slice([0, 0, 0], [-1, -1, 1]), tf.div(w, 2)); // x1
          const y1 = tf.sub(transRes.slice([0, 0, 1], [-1, -1, 1]), tf.div(h, 2)); // y1
          return tf
            .concat(
              [
                y1,
                x1,
                tf.add(y1, h), //y2
                tf.add(x1, w), //x2
              ],
              2
            )
            .squeeze();
        }); // process boxes [y1, x1, y2, x2]
      
        const [scores, classes] = tf.tidy(() => {
          // class scores
          const rawScores = transRes.slice([0, 0, 4], [-1, -1, numClass]).squeeze(0); // #6 only squeeze axis 0 to handle only 1 class models
          return [rawScores.max(1), rawScores.argMax(1)];
        }); // get max scores and classes index
      
        //const nms = await tf.image.nonMaxSuppressionAsync(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes
      
        const nms = tf.image.nonMaxSuppression(boxes, scores, 500, 0.45, 0.2); // NMS to filter boxes
        const boxes_data = boxes.gather(nms, 0).dataSync(); // indexing boxes by nms index
        const scores_data = scores.gather(nms, 0).dataSync(); // indexing scores by nms index
        const classes_data = classes.gather(nms, 0).dataSync(); // indexing classes by nms index

        output.boxes = boxes_data;
        output.scores = scores_data;
        output.classes = classes_data;
        output.ratios = [xRatio, yRatio];
      
        if(canvasRef) {
            renderBoxes(canvasRef, boxes_data, scores_data, classes_data, [xRatio, yRatio]); // render boxes
        }
        
        tf.dispose([res, transRes, boxes, scores, classes, nms]); // clear memory
        tf.engine().endScope(); // end of scoping
      };

    

    async function publicInit() {

        await tf.setBackend('webgl');

        const yolov8 = await tf.loadGraphModel(`${window.location.href}${modelName}_tfjs/model.json`, {
            onProgress: (fractions) => {
                console.log(fractions);
            },
        }
        );
        model.net = yolov8;
        model.inputShape = yolov8.inputs[0].shape;
        // warming up model
        const dummyInput = tf.ones(yolov8.inputs[0].shape);
        const warmupResults = yolov8.execute(dummyInput);
        tf.dispose([warmupResults, dummyInput]); // cleanup memory 
    }


    async function doDetectionPublic(vidSource, canvasRef) {
        await detect(vidSource,model,canvasRef);
    }

    function getOutPutPublic() {
        return output;
    }

    /**
     * Reveal public pointers to 
     * private functions and properties
     */
    return {
        doInit: publicInit,
        doDetection: doDetectionPublic,
        getOutPut:getOutPutPublic
    }
})();

export { tTFJSDetector };