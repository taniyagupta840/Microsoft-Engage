import React from "react";
import { LocalVideoStream, VideoStreamRenderer} from '@azure/communication-calling';
import { Paper } from "@material-ui/core";

import * as faceapi from 'face-api.js';

export default class LocalVideoPreviewCard extends React.Component {
    constructor(props) {
        super(props);
        this.deviceManager = props.deviceManager;
        this.selectedCameraDeviceId = props.selectedCameraDeviceId;
        this.state = {
            expressionDetectionOn : true,
        }
    }

    async componentDidMount() {
        try {
            const cameras = await this.deviceManager.getCameras();
            this.cameraDeviceInfo = cameras.find(cameraDevice => {
                return cameraDevice.id === this.selectedCameraDeviceId;
            });
            const localVideoStream = new LocalVideoStream(this.cameraDeviceInfo);
            const renderer = new VideoStreamRenderer(localVideoStream);
            this.view = await renderer.createView();
            const targetContainer = document.getElementById('localVideoRenderer');
            targetContainer.appendChild(this.view.target);

            Promise.all(
                [
                    faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
                    faceapi.nets.faceExpressionNet.loadFromUri('/models')
                ]
            ).then(() => {
                    if(this.state.expressionDetectionOn) {
                        const video = document.getElementById('localVideoRenderer').firstChild.firstChild;
                        setInterval(async() => {
                            // const detection = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                            const detection = await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions();
                            console.log(detection);},
                            1000
                        )
                    }
                })

        } catch (error) {
            console.error(error);
        }
    }

    render() {
        return (
            <Paper
                elevation={0}
                id="localVideoRenderer"
            />
        );
    }
}
