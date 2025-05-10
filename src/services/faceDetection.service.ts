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
            const img = new canvas.Image();
            setTimeout(() => {
                process()
            }, 500)

            const process = async () => {
                console.log('done loading image')
                img.src = `public/${imagePath}`;
                await faceapi.nets.faceLandmark68Net.loadFromDisk('./public/models');
                await faceapi.nets.ssdMobilenetv1.loadFromDisk('./public/models');
                const imgs: any = img
                const detect = await faceapi.detectSingleFace(imgs);
                console.log('done', detect)
                resolve(detect)
            }

        }
        catch (err) {
            console.log("error here in worker", err)
            reject(err)
        }
    })
}

detectFace(workerData.imagePath)
    .then((result) => {
        console.log('done in detectface here with success')
        parentPort?.postMessage(result)
    })
    .catch((err) => {
        console.log('done in detectface here with error')
        parentPort?.postMessage({ error: err.message })
    })
