import React from "react";
import { LocalVideoStream, VideoStreamRenderer} from '@azure/communication-calling';
import { Paper } from "@material-ui/core";
import * as faceapi from 'face-api.js';
import { firebaseDatabase } from './FirebaseConfig';

export default class LocalVideoPreviewCard extends React.Component {
    constructor(props) {
        super(props);
        this.deviceManager = props.deviceManager;
        this.selectedCameraDeviceId = props.selectedCameraDeviceId;
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
                        faceapi.loadTinyFaceDetectorModel('/models'),
                        faceapi.loadFaceExpressionModel('/models')
                    ]
                ).then(() => {
                    const video = this.view.target.firstChild;
                    setInterval(async() => {
                        await faceapi.detectSingleFace(video, new faceapi.TinyFaceDetectorOptions()).withFaceExpressions()
                            .then((detection) => {
                                if(!(detection===undefined)){
                                    const curExpression = detection.expressions.asSortedArray()[0];
                                    this.updateUserExpression(this.props.groupId, this.props.userId, curExpression);
                                    // console.log(curExpression);
                                }
                            })
                        },
                        500
                    )
                })

        } catch (error) {
            console.error(error);
        }
    }

    updateUserExpression(groupId,userId,curExpression) {
        firebaseDatabase.ref('expression').child(groupId).child(userId).set(curExpression);
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
