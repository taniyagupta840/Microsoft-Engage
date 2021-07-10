import React from "react";
import LocalVideoPreviewCard from './LocalVideoPreviewCard';
import RemoteParticipantCard from "./RemoteParticipantCard";
import StreamRenderer from "./StreamRenderer";
import { LocalVideoStream } from '@azure/communication-calling';
import { utils } from './Utilities/Utilities';
import { Dropdown, Panel, PanelType } from "office-ui-fabric-react";
import { CssBaseline, IconButton, Grid, Switch, Tooltip, Typography } from '@material-ui/core';
import ShareFile from './ShareFile';
import Chat from './Chat';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import ScreenShareIcon from '@material-ui/icons/ScreenShare';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShare';
import CallEndIcon from '@material-ui/icons/CallEnd';
import SettingsIcon from '@material-ui/icons/Settings';

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
            micMuted: true,
            onHold: this.call.state === 'LocalHold' || this.call.state === 'RemoteHold',
            screenShareOn: this.call.isScreenShareOn,
            cameraDeviceOptions: props.cameraDeviceOptions ? props.cameraDeviceOptions : [],
            speakerDeviceOptions: props.speakerDeviceOptions ? props.speakerDeviceOptions : [],
            microphoneDeviceOptions: props.microphoneDeviceOptions ? props.microphoneDeviceOptions : [],
            selectedCameraDeviceId: props.selectedCameraDeviceId,
            selectedSpeakerDeviceId: this.deviceManager.selectedSpeaker?.id,
            selectedMicrophoneDeviceId: this.deviceManager.selectedMicrophone?.id,
            showSettings: false,
            showLocalVideo: true,
            callMessage: undefined,
            openDialog: false,
            showExpression: false,
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
                // console.log('Call state changed ', this.call.state);
                this.setState({ callState: this.call.state });

                if (this.call.state !== 'None' &&
                    this.call.state !== 'Connecting' &&
                    this.call.state !== 'Incoming') {
                    if (this.callFinishConnectingResolve) {
                        this.callFinishConnectingResolve();
                    }
                }

                if (this.call.state === 'Disconnected') {
                    this.setState({ dominantRemoteParticipant: undefined });
                }
            }
            callStateChanged();
            this.call.on('stateChanged', callStateChanged);

            this.call.on('idChanged', () => {
                // console.log('Call id Changed ', this.call.id);
                this.setState({ callId: this.call.id });
            });

            this.call.on('isMutedChanged', () => {
                // console.log('Local microphone muted changed ', this.call.isMuted);
                this.setState({ micMuted: this.call.isMuted });
            });

            this.call.on('isScreenSharingOnChanged', () => {
                this.setState({ screenShareOn: this.call.isScreenShareOn });
            });

            this.call.remoteParticipants.forEach(rp => this.subscribeToRemoteParticipant(rp));
            this.call.on('remoteParticipantsUpdated', e => {
                // console.log(`Call=${this.call.callId}, remoteParticipantsUpdated, added=${e.added}, removed=${e.removed}`);
                e.added.forEach(p => {
                    // console.log('participantAdded', p);
                    this.subscribeToRemoteParticipant(p);
                });
                e.removed.forEach(p => {
                    // console.log('participantRemoved', p);
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
        }
    }

    subscribeToRemoteParticipant(participant) {
        if (!this.state.remoteParticipants.find((p) => { return p === participant })) {
            this.setState(prevState => ({ remoteParticipants: [...prevState.remoteParticipants, participant] }));
        }

        participant.on('displayNameChanged', () => {
            // console.log('displayNameChanged ', participant.displayName);
        });

        participant.on('stateChanged', () => {
            // console.log('Participant state changed', participant.identifier.communicationUserId, participant.state);
        });

        const addToListOfAllRemoteParticipantStreams = (participantStreams) => {
            if (participantStreams) {
                let participantStreamTuples = participantStreams.map(stream => { return { stream, participant, streamRendererComponentRef: React.createRef() }});
                participantStreamTuples.forEach(participantStreamTuple => {
                    if (!this.state.allRemoteParticipantStreams.find((v) => { return v === participantStreamTuple })) {
                        this.setState(prevState => ({
                            allRemoteParticipantStreams: [...prevState.allRemoteParticipantStreams, participantStreamTuple]
                        }));
                    }
                })
            }
        }

        const removeFromListOfAllRemoteParticipantStreams = (participantStreams) => {
            participantStreams.forEach(streamToRemove => {
                const tupleToRemove = this.state.allRemoteParticipantStreams.find((v) => { return v.stream === streamToRemove })
                if (tupleToRemove) {
                    this.setState({
                        allRemoteParticipantStreams: this.state.allRemoteParticipantStreams.filter(streamTuple => { return streamTuple !== tupleToRemove })
                    });
                }
            });
        }

        const handleVideoStreamsUpdated = (e) => {
            addToListOfAllRemoteParticipantStreams(e.added);
            removeFromListOfAllRemoteParticipantStreams(e.removed);
        }

        addToListOfAllRemoteParticipantStreams(participant.videoStreams);
        participant.on('videoStreamsUpdated', handleVideoStreamsUpdated);
    }

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

    async handleScreenSharingOnOff() {
        try {
            if (this.call.isScreenSharingOn) {
                await this.call.stopScreenSharing()
            } else {
                await this.call.startScreenSharing();
            }
            this.setState({ screenShareOn: this.call.isScreenSharingOn });
        } catch (e) {
            console.error(e);
        }
    }

    cameraDeviceSelectionChanged = async (event, item) => {
        const cameras = await this.deviceManager.getCameras();
        if(cameras.length>1){
            const cameraDeviceInfo = cameras.find(cameraDeviceInfo => { return cameraDeviceInfo.id === item.key });
            const localVideoStream = this.call.localVideoStreams[0];
            if (localVideoStream) {
                try {
                    localVideoStream.switchSource(cameraDeviceInfo);
                } catch (error) {
                    console.log(error);
                }
            }
            this.setState({ selectedCameraDeviceId: cameraDeviceInfo.id });
        }
    };

    speakerDeviceSelectionChanged = async (event, item) => {
        const speakers = await this.deviceManager.getSpeakers();
        const speakerDeviceInfo = speakers.find(speakerDeviceInfo => { return speakerDeviceInfo.id === item.key });
        this.deviceManager.selectSpeaker(speakerDeviceInfo);
        this.setState({ selectedSpeakerDeviceId: speakerDeviceInfo.id });
    };

    microphoneDeviceSelectionChanged = async (event, item) => {
        const microphones = await this.deviceManager.getMicrophones();
        const microphoneDeviceInfo = microphones.find(microphoneDeviceInfo => { return microphoneDeviceInfo.id === item.key });
        this.deviceManager.selectMicrophone(microphoneDeviceInfo);
        this.setState({ selectedMicrophoneDeviceId: microphoneDeviceInfo.id });
    };

    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Grid 
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="flex-start"
                    style={{ background: "url(/valley.svg) no-repeat center", backgroundSize: "cover" }}
                >

                    {/* --------------  --------------  -------------- */}
                    {/*               Participants' Avatar             */}
                    {/* --------------  --------------  -------------- */}
                    {
                        <Grid
                            container
                            item
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justify="center"
                            style={{ height: "10vh" }}
                        >
                            {
                                this.state.remoteParticipants.map(remoteParticipant =>
                                    <RemoteParticipantCard key={`${utils.getIdentifierText(remoteParticipant.identifier)}`} remoteParticipant={remoteParticipant} call={this.call} />
                                )
                            }
                        </Grid>
                    }

                    {/* --------------  --------------  -------------- */}
                    {/*            Participants' Video Tiles           */}
                    {/* --------------  --------------  -------------- */}
                    {
                        <Grid 
                            container
                            item
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justify="center"
                            style={{ height: "70vh" }}
                        >
                            {
                                this.state.callState === 'Connected' && this.state.remoteParticipants.length === 0 &&
                                <Typography 
                                    variant="subtitle2"
                                    color="textSecondary"
                                    style={{ fontFamily: "monospace" }}   
                                >
                                    No other participants currently on this call
                                </Typography>
                            }
                            {
                                this.state.callState === 'Connected' &&
                                this.state.allRemoteParticipantStreams.map(v => <StreamRenderer 
                                            key={`${utils.getIdentifierText(v.participant.identifier)}-${v.stream.mediaStreamType}-${v.stream.id}`}
                                            ref ={v.streamRendererComponentRef}
                                            stream={v.stream}
                                            remoteParticipant={v.participant}
                                            groupId={this.props.groupId}
                                            userId={utils.getIdentifierText(v.participant.identifier)}
                                            showExpression={this.state.showExpression}
                                        />
                                    )
                            }
                        </Grid>
                    }

                    {/* --------------  --------------  -------------- */}
                    {/*                   Meet Toolbar                 */}
                    {/* --------------  --------------  -------------- */}
                    {
                        <Grid
                            item 
                            container
                            spacing={0}
                            direction="row"
                            alignItems="center"
                            justify="center"
                            style= {{ height: "20vh" }}
                        >      
                            <span>
                                {   
                                    this.state.videoOn &&
                                    <Tooltip title='Camera-On' >
                                    <IconButton
                                        onClick = { () => this.handleVideoOnOff()}
                                    >
                                        <VideocamIcon color="primary" />
                                    </IconButton>
                                    </Tooltip>  
                                }
                                {   
                                    !this.state.videoOn &&
                                    <Tooltip title='Camera-Off' >
                                    <IconButton
                                        onClick = { () => this.handleVideoOnOff()} 
                                    >
                                        <VideocamOffIcon color="primary" />
                                    </IconButton>
                                    </Tooltip>
                                }
                            </span>
                            <span>
                                {
                                    !this.state.micMuted &&
                                    <Tooltip title='Mic-On' >
                                    <IconButton
                                        onClick = { () => this.handleMicOnOff()}
                                    >
                                        <MicIcon style={{color: "#4682b4"}} />
                                    </IconButton>
                                    </Tooltip>
                                }
                                {
                                    this.state.micMuted &&
                                    <Tooltip title='Mic-Off' >
                                    <IconButton
                                        onClick = { () => this.handleMicOnOff()}
                                    >
                                        <MicOffIcon style={{color: "#4682b4"}} />
                                    </IconButton>
                                    </Tooltip>
                                }
                            </span>
                            <span>
                                {
                                    !this.state.screenShareOn &&
                                    <Tooltip title='Screen-Share' >
                                    <IconButton
                                        onClick = { () => this.handleScreenSharingOnOff()} 
                                    >
                                        <ScreenShareIcon style={{color: "#2e8b57"}} />
                                    </IconButton>
                                    </Tooltip>
                                }
                                {
                                    this.state.screenShareOn &&
                                    <Tooltip title='Screen-Share Off' >
                                    <IconButton
                                        onClick = { () => this.handleScreenSharingOnOff() } 
                                    >
                                        <StopScreenShareIcon style={{color: "#2e8b57"}} />
                                    </IconButton>
                                    </Tooltip>
                                }
                            </span>
                            <span>
                                <Tooltip title='Setting' >
                                <IconButton
                                    onClick={() => this.setState({ showSettings: true })}
                                >
                                    <SettingsIcon />
                                </IconButton>
                                </Tooltip>
                            </span>
                            <span>
                                <ShareFile />
                            </span>
                            <span>
                                <Chat groupId={this.props.groupId} displayName={this.props.displayName} isRoom={false}/>
                            </span>
                            
                            <span>
                                {
                                    <Tooltip title='End-Call' >
                                    <IconButton
                                        onClick = { () => this.call.hangUp()} 
                                    >
                                        <CallEndIcon color="secondary"/>
                                    </IconButton>
                                    </Tooltip>
                                } 
                            </span>
                        </Grid>
                    }
                    <Panel 
                        type={PanelType.small}
                        isLightDismiss
                        isOpen={this.state.showSettings}
                        onDismiss={() => this.setState({ showSettings: false })}
                        closeButtonAriaLabel="Close"
                        headerText="SETTINGS"
                        style={{ paddingRight: "24px" }}    
                    >
                            <Typography 
                                color="textPrimary" 
                                variant="subtitle1" 
                                style={{ fontWeight: "bold", paddingTop: "3vh" }}
                            >
                                Video Settings
                            </Typography>
                            {
                                this.state.callState === 'Connected' &&
                                <span>
                                    <Typography 
                                        color="textSecondary" 
                                        variant="subtitle2" 
                                        style={{ fontWeight: "bold", marginTop: "1vh" }}
                                    >
                                        Camera
                                    </Typography>
                                    <Dropdown
                                        selectedKey={this.state.selectedCameraDeviceId}
                                        onChange={this.cameraDeviceSelectionChanged}
                                        options={this.state.cameraDeviceOptions}
                                        placeHolder={this.state.cameraDeviceOptions.length === 0 ? 'No camera devices found' : this.state.selectedCameraDeviceId }
                                        styles={{ dropdown: { width: 290 } }}
                                    />
                                </span>
                            }
                            <span>
                                <Typography 
                                    color="textSecondary" 
                                    variant="subtitle2" 
                                    style={{ fontWeight: "bold", marginTop: "1vh" }}
                                >
                                        Camera Preview
                                    </Typography>
                            </span>
                            {
                                this.state.showLocalVideo &&
                                <LocalVideoPreviewCard 
                                    groupId={this.props.groupId}
                                    userId={this.props.userId}
                                    selectedCameraDeviceId={this.state.selectedCameraDeviceId} 
                                    deviceManager={this.deviceManager}
                                />
                            }
                            <span>
                                <Typography 
                                    color="textSecondary" 
                                    variant="subtitle2" 
                                    style={{ fontWeight: "bold", marginTop: "1vh" }}
                                >
                                        Expression Detection
                                    </Typography>
                            </span>
                            <Switch
                                checked={this.state.showExpression}
                                onChange={() => this.setState({ showExpression: !this.state.showExpression })}
                                color="primary"
                                name="checkedB"
                                inputProps={{ 'aria-label': 'primary checkbox' }}
                            />
                            <Typography 
                                color="textPrimary" 
                                variant="subtitle1" 
                                style={{ fontWeight: "bold", marginTop: "1vh" }}
                            >
                                Sound Settings
                            </Typography>
                            {
                                this.state.callState === 'Connected' &&
                                <span>
                                    <Typography 
                                        color="textSecondary" 
                                        variant="subtitle2" 
                                        style={{ fontWeight: "bold", marginTop: "1vh" }}
                                    >
                                        Speaker
                                    </Typography>
                                    <Dropdown
                                        selectedKey={this.state.selectedSpeakerDeviceId}
                                        onChange={this.speakerDeviceSelectionChanged}
                                        options={this.state.speakerDeviceOptions}
                                        placeHolder={this.state.speakerDeviceOptions.length === 0 ? 'No speaker devices found' : this.state.selectedSpeakerDeviceId}
                                        styles={{ dropdown: { width: 290 } }}
                                    />
                                </span>
                            }
                            {
                                this.state.callState === 'Connected' &&
                                <span>
                                    <Typography 
                                        color="textSecondary" 
                                        variant="subtitle2" 
                                        style={{ fontWeight: "bold", marginTop: "1vh" }}
                                    >
                                        Microphone
                                    </Typography>
                                    <Dropdown
                                        selectedKey={this.state.selectedMicrophoneDeviceId}
                                        onChange={this.microphoneDeviceSelectionChanged}
                                        options={this.state.microphoneDeviceOptions}
                                        placeHolder={this.state.microphoneDeviceOptions.length === 0 ? 'No microphone devices found' : this.state.selectedMicrophoneDeviceId}
                                        styles={{ dropdown: { width: 290 } }}
                                    />
                                </span>
                            }
                    </Panel>
                </Grid>
            </React.Fragment>
        );
    }
}