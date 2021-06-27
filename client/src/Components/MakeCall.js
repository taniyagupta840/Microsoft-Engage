import React from "react";
import { CallClient, LocalVideoStream } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { Button, Dialog, DialogContent, DialogTitle, Divider, Grid, IconButton, TextField, Typography } from "@material-ui/core";
import AddBoxIcon from '@material-ui/icons/AddBox';
import LinkIcon from '@material-ui/icons/Link';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ShareIcon from '@material-ui/icons/Share';
import { MessageBar, MessageBarType } from 'office-ui-fabric-react'
import Login from './Login';
import CallCard from "./CallCard";
import { setLogLevel } from '@azure/logger';

export default class MakeCall extends React.Component {
    constructor(props) {
        super(props);
        this.callClient = null;
        this.callAgent = null;
        this.deviceManager = null;
        this.destinationGroup = undefined;
        this.callError = null;

        this.state = {
            id: undefined,
            loggedIn: false,
            call: undefined,
            selectedCameraDeviceId: null,
            selectedSpeakerDeviceId: null,
            selectedMicrophoneDeviceId: null,
            deviceManagerWarning: null,
            callError: null,
            createGroupCall: false,
            joinGroupCall: false,
            UUID: undefined,
            openDialog: false,
            displayName: undefined,
        };
    }

    handleLogIn = async (userDetails) => {
        if (userDetails) {
            try {
                const tokenCredential = new AzureCommunicationTokenCredential(userDetails.token);
                setLogLevel('verbose');
                this.callClient = new CallClient();
                this.callAgent = await this.callClient.createCallAgent(tokenCredential, { displayName: userDetails.displayName });
                window.callAgent = this.callAgent;
                this.deviceManager = await this.callClient.getDeviceManager();
                await this.deviceManager.askDevicePermission({ audio: true });
                await this.deviceManager.askDevicePermission({ video: true });
                this.callAgent.on('callsUpdated', e => {
                    console.log(`callsUpdated, added=${e.added}, removed=${e.removed}`);

                    e.added.forEach(call => {
                        this.setState({ call: call })
                    });

                    e.removed.forEach(call => {
                        if (this.state.call && this.state.call === call) {
                            this.displayCallEndReason(this.state.call.callEndReason);
                        }
                    });
                });

                this.setState({ loggedIn: true });
            } catch (e) {
                console.error(e);
            }
        }
    }

    displayCallEndReason = (callEndReason) => {
        if (callEndReason.code !== 0 || callEndReason.subCode !== 0) {
            this.setState({ callError: `Call end reason: code: ${callEndReason.code}, subcode: ${callEndReason.subCode}` });
        }

        this.setState({ call: null, incomingCall: null });
    }

    joinGroup = async (withVideo) => {
        try {
            const callOptions = await this.getCallOptions(withVideo);
            this.callAgent.join({ groupId: this.destinationGroup }, callOptions);
        } catch (e) {
            console.error('Failed to join a call', e);
            this.setState({ callError: 'Failed to join a call: ' + e });
        }
    };

    async getCallOptions(withVideo) {
        let callOptions = {
            videoOptions: {
                localVideoStreams: undefined
            },
            audioOptions: {
                muted: true
            }
        };

        let cameraWarning = undefined;
        let speakerWarning = undefined;
        let microphoneWarning = undefined;

        await this.deviceManager.askDevicePermission({ video: true });
        await this.deviceManager.askDevicePermission({ audio: true });

        const cameras = await this.deviceManager.getCameras();
        const cameraDevice = cameras[0];
        if (cameraDevice && cameraDevice?.id !== 'camera:') {
            this.setState({
                selectedCameraDeviceId: cameraDevice?.id,
                cameraDeviceOptions: cameras.map(camera => { return { key: camera.id, text: camera.name } })
            });
        }
        if (withVideo) {
            try {
                if (!cameraDevice || cameraDevice?.id === 'camera:') {
                    throw new Error('No camera devices found.');
                } else if (cameraDevice) {
                    callOptions.videoOptions = { localVideoStreams: [new LocalVideoStream(cameraDevice)] };
                }
            } catch (e) {
                cameraWarning = e.message;
            }
        }

        try {
            const speakers = await this.deviceManager.getSpeakers();
            const speakerDevice = speakers[0];
            if (!speakerDevice || speakerDevice.id === 'speaker:') {
                throw new Error('No speaker devices found.');
            } else if (speakerDevice) {
                this.setState({
                    selectedSpeakerDeviceId: speakerDevice.id,
                    speakerDeviceOptions: speakers.map(speaker => { return { key: speaker.id, text: speaker.name } })
                });
                await this.deviceManager.selectSpeaker(speakerDevice);
            }
        } catch (e) {
            speakerWarning = e.message;
        }

        try {
            const microphones = await this.deviceManager.getMicrophones();
            const microphoneDevice = microphones[0];
            if (!microphoneDevice || microphoneDevice.id === 'microphone:') {
                throw new Error('No microphone devices found.');
            } else {
                this.setState({
                    selectedMicrophoneDeviceId: microphoneDevice.id,
                    microphoneDeviceOptions: microphones.map(microphone => { return { key: microphone.id, text: microphone.name } })
                });
                await this.deviceManager.selectMicrophone(microphoneDevice);
            }
        } catch (e) {
            microphoneWarning = e.message;
        }

        if (cameraWarning || speakerWarning || microphoneWarning) {
            this.setState({
                deviceManagerWarning:
                    `${cameraWarning ? cameraWarning + ' ' : ''}
                    ${speakerWarning ? speakerWarning + ' ' : ''}
                    ${microphoneWarning ? microphoneWarning + ' ' : ''}`
            });
        }

        return callOptions;
    }

    async generateUuid() {
        const uuid = await fetch('/generate-uuid')
                        .then(async function(response){
                            return response.json().then(function(parsedResponse) {
                                console.log(parsedResponse);
                                return parsedResponse;
                            });
                        });

        this.setState({UUID: uuid});
    }

    copy = () =>{
        let uuid = this.state.UUID;
        navigator.clipboard.writeText(uuid);
        console.table("copied");
    }

    handleDialog = () => {
        this.setState({openDialog: !this.state.openDialog});
    };

    callbackDisplayName = (displayName) => {
        this.setState({displayName: displayName});
    }

    render() {
        return (
            <div>
                <Login onLoggedIn={this.handleLogIn} callbackDisplayName={this.callbackDisplayName} />
                { 
                    this.state.loggedIn && !this.state.createGroupCall && !this.state.joinGroupCall &&
                    <Grid
                        container
                        spacing={3}
                        direction="row"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '100vh' }}
                    >
                        <Grid item>
                            <Button
                                startIcon={<AddBoxIcon />}
                                onClick={ () => {this.generateUuid();
                                                 this.handleDialog();} }
                            >
                                Create Link
                            </Button>
                        </Grid>
                        <Grid item>
                            <Button
                                startIcon={<LinkIcon />}
                                onClick={ () => {this.setState({joinGroupCall: true})} }
                            >
                                Join Link
                            </Button>
                        </Grid>
                        <Dialog
                            open={this.state.openDialog}
                            onClose={this.handleDialog}
                            aria-labelledby="responsive-dialog-title"
                            fullWidth
                        >
                            <DialogTitle >
                                <Typography 
                                    color="textSecondary"
                                    style={{ textAlign: "center", fontWeight: "bold"}}
                                >
                                    Join Code
                                </Typography>
                            </DialogTitle>
                            <Divider variant="middle" />
                            <DialogContent
                                style={{ minHeight: "30vh", maxHeight: "10vh" }}
                            >
                                <Grid 
                                    container
                                    spacing={3}
                                    direction="column"
                                    alignItems="center"
                                    justify="center"
                                >
                                    <Grid 
                                        container
                                        item
                                        justify="center"
                                    >
                                        <Button>
                                            <Typography
                                                color="primary"
                                                variant="subtitle2"
                                            >
                                                {this.state.UUID}
                                            </Typography>
                                        </Button>   
                                    </Grid>
                                    <Grid
                                       container
                                       item 
                                       justify="space-evenly"
                                    >
                                        <Grid 
                                            item 
                                        >
                                            <IconButton
                                            >
                                                <ShareIcon />
                                            </IconButton>
                                        </Grid>
                                        <Grid 
                                            item 
                                        >
                                            <IconButton
                                                onClick={ this.copy }    
                                            >
                                                <FileCopyIcon />
                                            </IconButton>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </DialogContent>
                         </Dialog>
                    </Grid>
                }
                <div className="">
                    <div className="">
                        {
                            this.state.callError &&
                            <MessageBar
                                messageBarType={MessageBarType.error}
                                isMultiline={false}
                                onDismiss={() => { this.setState({ callError: undefined }) }}
                                dismissButtonAriaLabel="Close">
                                <b>{this.state.callError}</b>
                            </MessageBar>
                        }
                        {
                            this.state.deviceManagerWarning &&
                            <MessageBar
                                messageBarType={MessageBarType.warning}
                                isMultiline={false}
                                onDismiss={() => { this.setState({ deviceManagerWarning: undefined }) }}
                                dismissButtonAriaLabel="Close">
                                <b>{this.state.deviceManagerWarning}</b>
                            </MessageBar>
                        }
                        {
                            !this.state.call && this.state.joinGroupCall &&
                            <Grid
                                container
                                spacing={2}
                                direction="column"
                                alignItems="center"
                                justify="center"
                                style={{ minHeight: '100vh' }}   
                            >
                                <Grid 
                                    container
                                    item
                                    justify="center"
                                >
                                    <TextField 
                                        variant="outlined"
                                        placeholder=" - Enter Joining Code - " 
                                        size="small"
                                        onChange={ (e) => { this.destinationGroup = e.target.value }}
                                    />
                                </Grid>
                                <Grid
                                    container
                                    item
                                    justify="center"
                                >
                                    <Button
                                        color="primary"
                                        size="small"
                                        onClick={() => {this.joinGroup(true);}}
                                    >
                                        <Typography variant="subtitle2">
                                            Join    
                                        </Typography>
                                    </Button>
                                </Grid>
                            </Grid>
                        }
                        {
                            this.state.call &&
                            <CallCard
                                groupId={this.destinationGroup}
                                displayName={this.state.displayName}
                                call={this.state.call}
                                deviceManager={this.deviceManager}
                                selectedCameraDeviceId={this.state.selectedCameraDeviceId}
                                cameraDeviceOptions={this.state.cameraDeviceOptions}
                                speakerDeviceOptions={this.state.speakerDeviceOptions}
                                microphoneDeviceOptions={this.state.microphoneDeviceOptions}
                                onShowCameraNotFoundWarning={(show) => { this.setState({ showCameraNotFoundWarning: show }) }}
                                onShowSpeakerNotFoundWarning={(show) => { this.setState({ showSpeakerNotFoundWarning: show }) }}
                                onShowMicrophoneNotFoundWarning={(show) => { this.setState({ showMicrophoneNotFoundWarning: show }) }} />
                        }
                    </div>
                </div>
            </div>
        );
    }
}