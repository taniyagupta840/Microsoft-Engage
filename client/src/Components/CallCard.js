import React from "react";
import { Icon } from '@fluentui/react/lib/Icon';
import LocalVideoPreviewCard from './LocalVideoPreviewCard';
import { LocalVideoStream, Features } from '@azure/communication-calling';
import { utils } from './Utilities/Utilities';

export default class CallCard extends React.Component {
    constructor(props) {
        super(props);
        this.callFinishConnectingResolve = undefined;
        this.call = props.call;
        this.deviceManager = props.deviceManager;
        this.state = {
            callState: this.call.state,
            callId: this.call.id,
            remoteParticipants: this.call.remoteParticipants,
            allRemoteParticipantStreams: [],
            videoOn: !!this.call.localVideoStreams[0],
            micMuted: false,
            onHold: this.call.state === 'LocalHold' || this.call.state === 'RemoteHold',
            screenShareOn: this.call.isScreenShareOn,
            cameraDeviceOptions: props.cameraDeviceOptions ? props.cameraDeviceOptions : [],
            speakerDeviceOptions: props.speakerDeviceOptions ? props.speakerDeviceOptions : [],
            microphoneDeviceOptions: props.microphoneDeviceOptions ? props.microphoneDeviceOptions : [],
            selectedCameraDeviceId: props.selectedCameraDeviceId,
            selectedSpeakerDeviceId: this.deviceManager.selectedSpeaker?.id,
            selectedMicrophoneDeviceId: this.deviceManager.selectedMicrophone?.id,
            showSettings: false,
            showLocalVideo: false,
            callMessage: undefined,
            dominantSpeakerMode: false,
            dominantRemoteParticipant: undefined
        };
    }

    async componentWillMount() {
        if (this.call) {
            this.deviceManager.on('videoDevicesUpdated', async e => {
                let newCameraDeviceToUse = undefined;
                e.added.forEach(addedCameraDevice => {
                    newCameraDeviceToUse = addedCameraDevice;
                    const addedCameraDeviceOption = { key: addedCameraDevice.id, text: addedCameraDevice.name };
                    this.setState(prevState => ({
                        cameraDeviceOptions: [...prevState.cameraDeviceOptions, addedCameraDeviceOption]
                    }));
                });
                // When connectnig a new camera, ts device manager automatically switches to use this new camera and
                // this.call.localVideoStream[0].source is never updated. Hence I have to do the following logic to update
                // this.call.localVideoStream[0].source to the newly added camera. This is a bug. Under the covers, this.call.localVideoStreams[0].source
                // should have been updated automatically by the sdk.
                if (newCameraDeviceToUse) {
                    try {
                        await this.call.localVideoStreams[0]?.switchSource(newCameraDeviceToUse);
                        this.setState({ selectedCameraDeviceId: newCameraDeviceToUse.id });
                    } catch (error) {
                        console.error('Failed to switch to newly added video device', error);
                    }
                }

                e.removed.forEach(removedCameraDevice => {
                    this.setState(prevState => ({
                        cameraDeviceOptions: prevState.cameraDeviceOptions.filter(option => { return option.key !== removedCameraDevice.id })
                    }))
                });

                // If the current camera being used is removed, pick a new random one
                if (!this.state.cameraDeviceOptions.find(option => { return option.key === this.state.selectedCameraDeviceId })) {
                    const newSelectedCameraId = this.state.cameraDeviceOptions[0]?.key;
                    const cameras = await this.deviceManager.getCameras();
                    const videoDeviceInfo = cameras.find(c => { return c.id === newSelectedCameraId });
                    await this.call.localVideoStreams[0]?.switchSource(videoDeviceInfo);
                    this.setState({ selectedCameraDeviceId: newSelectedCameraId });
                }
            });

            this.deviceManager.on('audioDevicesUpdated', e => {
                e.added.forEach(addedAudioDevice => {
                    const addedAudioDeviceOption = { key: addedAudioDevice.id, text: addedAudioDevice.name };
                    if (addedAudioDevice.deviceType === 'Speaker') {
                        this.setState(prevState => ({
                            speakerDeviceOptions: [...prevState.speakerDeviceOptions, addedAudioDeviceOption]
                        }));
                    } else if (addedAudioDevice.deviceType === 'Microphone') {
                        this.setState(prevState => ({
                            microphoneDeviceOptions: [...prevState.microphoneDeviceOptions, addedAudioDeviceOption]
                        }));
                    }
                });

                e.removed.forEach(removedAudioDevice => {
                    if (removedAudioDevice.deviceType === 'Speaker') {
                        this.setState(prevState => ({
                            speakerDeviceOptions: prevState.speakerDeviceOptions.filter(option => { return option.key !== removedAudioDevice.id })
                        }))
                    } else if (removedAudioDevice.deviceType === 'Microphone') {
                        this.setState(prevState => ({
                            microphoneDeviceOptions: prevState.microphoneDeviceOptions.filter(option => { return option.key !== removedAudioDevice.id })
                        }))
                    }
                });
            });

            this.deviceManager.on('selectedSpeakerChanged', () => {
                this.setState({ selectedSpeakerDeviceId: this.deviceManager.selectedSpeaker?.id });
            });

            this.deviceManager.on('selectedMicrophoneChanged', () => {
                this.setState({ selectedMicrophoneDeviceId: this.deviceManager.selectedMicrophone?.id });
            });

            const callStateChanged = () => {
                console.log('Call state changed ', this.call.state);
                this.setState({ callState: this.call.state });

                if (this.call.state !== 'None' &&
                    this.call.state !== 'Connecting' &&
                    this.call.state !== 'Incoming') {
                    if (this.callFinishConnectingResolve) {
                        this.callFinishConnectingResolve();
                    }
                }
                // if (this.call.state === 'Incoming') {
                //     this.setState({ selectedCameraDeviceId: cameraDevices[0]?.id });
                //     this.setState({ selectedSpeakerDeviceId: speakerDevices[0]?.id });
                //     this.setState({ selectedMicrophoneDeviceId: microphoneDevices[0]?.id });
                // }
                if (this.call.state === 'Disconnected') {
                    this.setState({ dominantRemoteParticipant: undefined });
                }
            }
            callStateChanged();
            this.call.on('stateChanged', callStateChanged);

            this.call.on('idChanged', () => {
                console.log('Call id Changed ', this.call.id);
                this.setState({ callId: this.call.id });
            });

            this.call.on('isMutedChanged', () => {
                console.log('Local microphone muted changed ', this.call.isMuted);
                this.setState({ micMuted: this.call.isMuted });
            });

            this.call.on('isScreenSharingOnChanged', () => {
                this.setState({ screenShareOn: this.call.isScreenShareOn });
            });

            this.call.remoteParticipants.forEach(rp => this.subscribeToRemoteParticipant(rp));
            this.call.on('remoteParticipantsUpdated', e => {
                console.log(`Call=${this.call.callId}, remoteParticipantsUpdated, added=${e.added}, removed=${e.removed}`);
                e.added.forEach(p => {
                    console.log('participantAdded', p);
                    this.subscribeToRemoteParticipant(p);
                });
                e.removed.forEach(p => {
                    console.log('participantRemoved', p);
                    if(p.callEndReason) {
                        this.setState(prevState => ({
                            callMessage: `${prevState.callMessage ? prevState.callMessage + `\n` : ``}
                                        Remote participant ${utils.getIdentifierText(p.identifier)} disconnected: code: ${p.callEndReason.code}, subCode: ${p.callEndReason.subCode}.`
                        }));
                    }
                    this.setState({ remoteParticipants: this.state.remoteParticipants.filter(remoteParticipant => { return remoteParticipant !== p }) });
                    this.setState({ streams: this.state.allRemoteParticipantStreams.filter(s => { return s.participant !== p }) });

                });
            });

            // const dominantSpeakersChangedHandler = async () => {
            //     try {
            //         if(this.state.dominantSpeakerMode) {

            //             const newDominantSpeakerIdentifier = this.call.api(Features.DominantSpeakers).dominantSpeakers.speakersList[0];
            //             if (newDominantSpeakerIdentifier) {
            //                 console.log(`DominantSpeaker changed, new dominant speaker: ${newDominantSpeakerIdentifier ? utils.getIdentifierText(newDominantSpeakerIdentifier) : `None`}`);

            //                 // Set the new dominant remote participant
            //                 const newDominantRemoteParticipant = utils.getRemoteParticipantObjFromIdentifier(this.call, newDominantSpeakerIdentifier);

            //                 // Get the new dominant remote participant's stream tuples
            //                 const streamsToRender = [];
            //                 for (const streamTuple of this.state.allRemoteParticipantStreams) {
            //                     if (streamTuple.participant === newDominantRemoteParticipant && streamTuple.stream.isAvailable) {
            //                         streamsToRender.push(streamTuple);
            //                         if(!streamTuple.streamRendererComponentRef.current.getRenderer()) {
            //                             await streamTuple.streamRendererComponentRef.current.createRenderer();
            //                         };
            //                     }
            //                 }

            //                 const previousDominantSpeaker = this.state.dominantRemoteParticipant;
            //                 this.setState({ dominantRemoteParticipant: newDominantRemoteParticipant });

            //                 if(previousDominantSpeaker) {
            //                     // Remove the old dominant remote participant's streams
            //                     this.state.allRemoteParticipantStreams.forEach(streamTuple => {
            //                         if (streamTuple.participant === previousDominantSpeaker) {
            //                             streamTuple.streamRendererComponentRef.current.disposeRenderer();
            //                         }
            //                     });
            //                 }

            //                 // Render the new dominany speaker's streams
            //                 streamsToRender.forEach(streamTuple => {
            //                     streamTuple.streamRendererComponentRef.current.attachRenderer();
            //                 })

            //             } else {
            //                 console.warn('New dominant speaker is undefined');
            //             }
            //         }
            //     } catch (error) {
            //         console.error(error);
            //     }
            // };

            // const dominantSpeakerIdentifier = this.call.api(Features.DominantSpeakers).dominantSpeakers.speakersList[0];
            // if(dominantSpeakerIdentifier) {
            //     this.setState({ dominantRemoteParticipant: utils.getRemoteParticipantObjFromIdentifier(dominantSpeakerIdentifier) })
            // }
            // this.call.api(Features.DominantSpeakers).on('dominantSpeakersChanged', dominantSpeakersChangedHandler);
        }
    }

    // subscribeToRemoteParticipant(participant) {
    //     if (!this.state.remoteParticipants.find((p) => { return p === participant })) {
    //         this.setState(prevState => ({ remoteParticipants: [...prevState.remoteParticipants, participant] }));
    //     }

    //     participant.on('displayNameChanged', () => {
    //         console.log('displayNameChanged ', participant.displayName);
    //     });

    //     participant.on('stateChanged', () => {
    //         console.log('Participant state changed', participant.identifier.communicationUserId, participant.state);
    //     });

    //     const addToListOfAllRemoteParticipantStreams = (participantStreams) => {
    //         if (participantStreams) {
    //             let participantStreamTuples = participantStreams.map(stream => { return { stream, participant, streamRendererComponentRef: React.createRef() }});
    //             participantStreamTuples.forEach(participantStreamTuple => {
    //                 if (!this.state.allRemoteParticipantStreams.find((v) => { return v === participantStreamTuple })) {
    //                     this.setState(prevState => ({
    //                         allRemoteParticipantStreams: [...prevState.allRemoteParticipantStreams, participantStreamTuple]
    //                     }));
    //                 }
    //             })
    //         }
    //     }

    //     const removeFromListOfAllRemoteParticipantStreams = (participantStreams) => {
    //         participantStreams.forEach(streamToRemove => {
    //             const tupleToRemove = this.state.allRemoteParticipantStreams.find((v) => { return v.stream === streamToRemove })
    //             if (tupleToRemove) {
    //                 this.setState({
    //                     allRemoteParticipantStreams: this.state.allRemoteParticipantStreams.filter(streamTuple => { return streamTuple !== tupleToRemove })
    //                 });
    //             }
    //         });
    //     }

    //     const handleVideoStreamsUpdated = (e) => {
    //         addToListOfAllRemoteParticipantStreams(e.added);
    //         removeFromListOfAllRemoteParticipantStreams(e.removed);
    //     }

    //     addToListOfAllRemoteParticipantStreams(participant.videoStreams);
    //     participant.on('videoStreamsUpdated', handleVideoStreamsUpdated);
    // }

    async handleVideoOnOff() {
        try {
            const cameras = await this.deviceManager.getCameras();
            const cameraDeviceInfo = cameras.find(cameraDeviceInfo => {
                return cameraDeviceInfo.id === this.state.selectedCameraDeviceId
            });
            let selectedCameraDeviceId = this.state.selectedCameraDeviceId;
            let localVideoStream
            if (this.state.selectedCameraDeviceId) {
                localVideoStream = new LocalVideoStream(cameraDeviceInfo);

            } else if (!this.state.videoOn) {
                const cameras = await this.deviceManager.getCameras();
                selectedCameraDeviceId = cameras[0].id;
                localVideoStream = new LocalVideoStream(cameras[0]);
            }

            if (this.call.state === 'None' ||
                this.call.state === 'Connecting' ||
                this.call.state === 'Incoming') {
                if (this.state.videoOn) {
                    this.setState({ videoOn: false });
                } else {
                    this.setState({ videoOn: true, selectedCameraDeviceId })
                }
                await this.watchForCallFinishConnecting();
                if (this.state.videoOn) {
                    this.call.startVideo(localVideoStream).catch(error => { });
                } else {
                    this.call.stopVideo(this.call.localVideoStreams[0]).catch(error => { });
                }
            } else {
                if (this.call.localVideoStreams[0]) {
                    await this.call.stopVideo(this.call.localVideoStreams[0]);
                } else {
                    await this.call.startVideo(localVideoStream);
                }
            }

            this.setState({ videoOn: this.call.localVideoStreams[0] ? true : false });
        } catch (e) {
            console.error(e);
        }
    }

    async watchForCallFinishConnecting() {
        return new Promise((resolve) => {
            if (this.state.callState !== 'None' && this.state.callState !== 'Connecting' && this.state.callState !== 'Incoming') {
                resolve();
            } else {
                this.callFinishConnectingResolve = resolve;
            }
        }).then(() => {
            this.callFinishConnectingResolve = undefined;
        });
    }

    async handleMicOnOff() {
        try {
            if (!this.call.isMuted) {
                await this.call.mute();
            } else {
                await this.call.unmute();
            }
            this.setState({ micMuted: this.call.isMuted });
        } catch (e) {
            console.error(e);
        }
    }

    // async handleHoldUnhold() {
    //     try {
    //         if (this.call.state === 'LocalHold') {
    //             this.call.resume();
    //         } else {
    //             this.call.hold();
    //         }
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    // async handleScreenSharingOnOff() {
    //     try {
    //         if (this.call.isScreenSharingOn) {
    //             await this.call.stopScreenSharing()
    //         } else {
    //             await this.call.startScreenSharing();
    //         }
    //         this.setState({ screenShareOn: this.call.isScreenSharingOn });
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    // async toggleDominantSpeakerMode() {
    //     try {
    //         if (this.state.dominantSpeakerMode) {
    //             // Turn off dominant speaker mode
    //             this.setState({ dominantSpeakerMode: false });
    //             // Render all remote participants's streams
    //             for (const streamTuple of this.state.allRemoteParticipantStreams) {
    //                 if(streamTuple.stream.isAvailable && !streamTuple.streamRendererComponentRef.current.getRenderer()) {
    //                     await streamTuple.streamRendererComponentRef.current.createRenderer();
    //                     streamTuple.streamRendererComponentRef.current.attachRenderer();
    //                 }
    //             }
    //         } else {
    //             // Turn on dominant speaker mode
    //             this.setState({ dominantSpeakerMode: true });
    //             // Dispose of all remote participants's stream renderers
    //             const dominantSpeakerIdentifier = this.call.api(Features.DominantSpeakers).dominantSpeakers.speakersList[0];
    //             if(!dominantSpeakerIdentifier) {
    //                 this.state.allRemoteParticipantStreams.forEach(v => {
    //                     v.streamRendererComponentRef.current.disposeRenderer();
    //                 });

    //                 // Return, no action needed
    //                 return;
    //             }

    //             // Set the dominant remote participant obj
    //             const dominantRemoteParticipant = utils.getRemoteParticipantObjFromIdentifier(this.call, dominantSpeakerIdentifier);
    //             this.setState({ dominantRemoteParticipant: dominantRemoteParticipant });
    //             // Dispose of all the remote participants's stream renderers except for the dominant speaker
    //             this.state.allRemoteParticipantStreams.forEach(v => {
    //                 if(v.participant !== dominantRemoteParticipant) {
    //                     v.streamRendererComponentRef.current.disposeRenderer();
    //                 }
    //             });
    //         }
    //     } catch (e) {
    //         console.error(e);
    //     }
    // }

    // cameraDeviceSelectionChanged = async (event, item) => {
    //     const cameras = await this.deviceManager.getCameras();
    //     const cameraDeviceInfo = cameras.find(cameraDeviceInfo => { return cameraDeviceInfo.id === item.key });
    //     const localVideoStream = this.call.localVideoStreams[0];
    //     if (localVideoStream) {
    //         localVideoStream.switchSource(cameraDeviceInfo);
    //     }
    //     this.setState({ selectedCameraDeviceId: cameraDeviceInfo.id });
    // };

    // speakerDeviceSelectionChanged = async (event, item) => {
    //     const speakers = await this.deviceManager.getSpeakers();
    //     const speakerDeviceInfo = speakers.find(speakerDeviceInfo => { return speakerDeviceInfo.id === item.key });
    //     this.deviceManager.selectSpeaker(speakerDeviceInfo);
    //     this.setState({ selectedSpeakerDeviceId: speakerDeviceInfo.id });
    // };

    // microphoneDeviceSelectionChanged = async (event, item) => {
    //     const microphones = await this.deviceManager.getMicrophones();
    //     const microphoneDeviceInfo = microphones.find(microphoneDeviceInfo => { return microphoneDeviceInfo.id === item.key });
    //     this.deviceManager.selectMicrophone(microphoneDeviceInfo);
    //     this.setState({ selectedMicrophoneDeviceId: microphoneDeviceInfo.id });
    // };

    render() {
        return (
            <div className="ms-Grid mt-2">
                <div className="ms-Grid-row">
                    {
                        this.state.callState === 'Connected' &&
                        <div className="ms-Grid-col ms-sm12 ms-lg12 ms-xl12 ms-xxl3">
                            <div>
                                {
                                    this.state.showLocalVideo && this.state.videoOn &&
                                    <div className="mb-3">
                                        <LocalVideoPreviewCard selectedCameraDeviceId={this.state.selectedCameraDeviceId} deviceManager={this.deviceManager} />
                                    </div>
                                }
                            </div>
                        </div>
                    }
                    <div className={this.state.callState === 'Connected' ? `ms-Grid-col ms-sm12 ms-lg12 ms-xl12 ms-xxl9` : 'ms-Grid-col ms-sm12 ms-lg12 ms-xl12 ms-xxl12'}>
                        <div className="my-4">
                            <div className="text-center">
                                <span className="in-call-button"
                                    title={`Turn your video ${this.state.videoOn ? 'off' : 'on'}`}
                                    variant="secondary"
                                    onClick={() => this.handleVideoOnOff()}>
                                    {
                                        this.state.videoOn &&
                                        <Icon iconName="Video" />
                                    }
                                    {
                                        !this.state.videoOn &&
                                        <Icon iconName="VideoOff" />
                                    }
                                </span>
                                <span className="in-call-button"
                                    title={`${this.state.micMuted ? 'Unmute' : 'Mute'} your microphone`}
                                    variant="secondary"
                                    onClick={() => this.handleMicOnOff()}>
                                    {
                                        this.state.micMuted &&
                                        <Icon iconName="MicOff2" />
                                    }
                                    {
                                        !this.state.micMuted &&
                                        <Icon iconName="Microphone" />
                                    }
                                </span>
                                <span className="in-call-button"
                                    onClick={() => this.call.hangUp()}>
                                    <Icon iconName="DeclineCall" />
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
