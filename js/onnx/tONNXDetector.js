//https://github.com/Hyuto/yolov8-onnxruntime-web

import labels from "./labels.json";
import { renderBoxes } from "./renderBox";


// JavaScript Revealing Module Pattern
const tONNXDetector = (function () {
    // Private Properties
    let modelName = "yolov8n.onnx";
    let model = {
        net: null,
        inputShape: [1, 3, 640, 640],
    };
    
    let numClass = labels.length;

    let output = {
        boxes: null,
        scores: null,
        classes: null,
        ratios:[]

    }


    async function publicInit() {

        let yolov8  =  await ort.InferenceSession.create(modelName, { executionProviders: ['webgpu'] });
        //COLD START MODEL
        const tensor = new ort.Tensor("float32",new Float32Array(model.inputShape.reduce((a, b) => a * b)),model.inputShape);
        await yolov8.run({ images: tensor });
        model.net = yolov8;
    }




    /**
     * Reveal public pointers to 
     * private functions and properties
     */
    return {
        doInit: publicInit,
    }
})();

export { tONNXDetector };