import { parentPort, workerData } from 'worker_threads'
import * as faceapi from 'face-api.js';
import * as canvas from 'canvas'


async function detectFace(imagePath: string) {
    return new Promise(async (resolve, reject) => {
        try {
            //turn the base 64 into a file
            const { Canvas, Image, ImageData }: any = canvas
            console.log('image path', imagePath)
            faceapi.env.monkeyPatch({ Canvas, Image, ImageData });
            const img:any= new canvas.Image();
            img.src = `public/${imagePath}`;
               await faceapi.nets.faceLandmark68Net.loadFromDisk('./public/models');
               await faceapi.nets.ssdMobilenetv1.loadFromDisk('./public/models');
               const detect = await faceapi.detectSingleFace(img);
               console.log('done',detect)
               resolve(detect)
        }
        catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

detectFace(workerData.imagePath)
  .then((result) => parentPort?.postMessage(result))
  .catch((err) => parentPort?.postMessage({ error: err.message }))
