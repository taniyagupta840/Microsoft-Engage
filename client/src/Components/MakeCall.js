import React from "react";
import { CallClient, LocalVideoStream } from '@azure/communication-calling';
import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { AppBar, Button, Dialog, DialogContent, Grid, IconButton, Paper, TextField, Toolbar, Tooltip, Typography } from "@material-ui/core";
// import { MessageBar, MessageBarType } from 'office-ui-fabric-react';
import Login from './Login';
import CallCard from "./CallCard";
// import { setLogLevel } from '@azure/logger';
import Chat from './Chat';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ShareIcon from '@material-ui/icons/Share';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import DuoIcon from '@material-ui/icons/Duo';
import MeetingRoomIcon from '@material-ui/icons/MeetingRoom';
import ChatIcon from '@material-ui/icons/Chat';

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
            userId: undefined,
            roomStatus: false,
        };
    }

    /**
     * Processing ACS Token & initialising device permissions
     * @param {*} userDetails 
     */
    handleLogIn = async (userDetails) => {
        if (userDetails) {
            try {
                const tokenCredential = new AzureCommunicationTokenCredential(userDetails.token);
                this.setState({userId: userDetails.id});
                // setLogLevel('verbose');
                this.callClient = new CallClient();
                this.callAgent = await this.callClient.createCallAgent(tokenCredential, { displayName: userDetails.displayName });
                window.callAgent = this.callAgent;
                this.deviceManager = await this.callClient.getDeviceManager();
                await this.deviceManager.askDevicePermission({ audio: true });
                await this.deviceManager.askDevicePermission({ video: true });
                this.callAgent.on('callsUpdated', e => {

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

    /**
     * Initialising the primary camera, microphone & speaker
     * @param {*} withVideo 
     * @returns 
     */
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

    /**
     * Fetching UUID
     */
    async generateUuid() {
        const uuid = await fetch('/generate-uuid')
                        .then(async function(response){
                            return response.json().then(function(parsedResponse) {
                                return parsedResponse;
                            });
                        });

        this.setState({UUID: uuid});
    }

    copy = () =>{
        let uuid = this.state.UUID;
        navigator.clipboard.writeText(uuid);
    }

    handleDialog = () => {
        this.setState({openDialog: !this.state.openDialog});
    };

    callbackDisplayName = (displayName) => {
        this.setState({displayName: displayName});
    }

    render() {
        return (
            <React.Fragment>

                {
                    <Login onLoggedIn={this.handleLogIn} callbackDisplayName={this.callbackDisplayName} />
                }

                {/* --------------  --------------  -------------- */}
                {/*                 Create & Join Page             */}
                {/* --------------  --------------  -------------- */}
                { 
                    this.state.loggedIn && !this.state.createGroupCall && !this.state.joinGroupCall &&
                    <Grid
                        container
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '100vh', background: "url(/wave.svg) no-repeat", backgroundSize: "cover" }}
                    >
                        <Grid item style={{ margin: "7vh" }}>
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={ () => {this.generateUuid();
                                                 this.handleDialog();} }
                            >
                                Create Meet
                            </Button>
                        </Grid>
                        <Grid item style={{ margin: "7vh" }}>
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={ () => {this.setState({joinGroupCall: true})} }
                            >
                                Join Room
                            </Button>
                        </Grid>
                    </Grid>    
                }
                {
                    <Dialog
                    open={this.state.openDialog}
                    onClose={this.handleDialog}
                    maxWidth="xs"
                    fullWidth={true}
                >
                    <Grid
                        container
                        direction="row"
                        justify="center"
                        alignItems="center"
                        style={{ background: "linear-gradient(to bottom , #002984 0%, #757de8 100%)", padding: "1vh" }}
                    >
                        <Typography 
                            variant="subtitle1"
                            style={{ color:"#ffffff", textAlign: "center", fontWeight: "bold", fontFamily: "monospace" }}
                        >
                            MEETING CODE
                        </Typography>
                    </Grid>
                    <DialogContent
                        style={{ minHeight: "20vh", marginTop: "2vh" }}
                    >
                        <Grid 
                            container
                            spacing={0}
                            direction="column"
                            alignItems="center"
                            justify="space-around"
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
                               style={{ marginTop: "1vh" }}
                            >
                                <Grid 
                                    item 
                                >
                                    <Tooltip title="Share via Email" >
                                        <IconButton
                                            href={`mailto:test@example.com?subject=Agile Teams Joining Code&body=You are invited to join Agile Teams Meet. Your Joining Code: ${this.state.UUID}`}
                                        >
                                            <ShareIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                                <Grid 
                                    item 
                                >
                                    <Tooltip title="Copy" >
                                        <IconButton
                                            onClick={ this.copy }    
                                        >
                                            <FileCopyIcon />
                                        </IconButton>
                                    </Tooltip>
                                </Grid>
                            </Grid>
                        </Grid>
                    </DialogContent>
                 </Dialog>
                }
                <div>
                    <div>

                        {/* --------------  --------------  -------------- */}
                        {/*                 Enter Meet Code                */}
                        {/* --------------  --------------  -------------- */}
                        {/* {
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
                        } */}
                        {
                            !this.state.call && this.state.joinGroupCall && !this.state.roomStatus &&
                            <Grid
                                container
                                spacing={0}
                                direction="column"
                                alignItems="center"
                                justify="center"
                                style={{ minHeight: '100vh', background: "url(/wave.svg) no-repeat", backgroundSize: "cover"  }}   
                            >
                                <Paper
                                    elevation={5}
                                    style={{ minHeight: "40vh", minWidth: "50vh" }}
                                >
                                    <Grid
                                        container
                                        justify="center"
                                        alignItems="center"
                                        style={{ minHeight: "40vh", minWidth: "50vh", background: "linear-gradient(rgba(255, 255, 255, 0.95), rgba(255, 255, 255, 0.8)), url(/teams.png) no-repeat center", backgroundSize: "contain"}}
                                    >
                                        <Grid 
                                            item
                                            container
                                            spacing={2}
                                        >
                                            <Grid
                                                container
                                                item
                                                justify="center"
                                            >
                                                <Typography
                                                    color="primary"
                                                    style={{  fontWeight: "bold" }}
                                                    variant="caption"
                                                >
                                                    ENTER JOINING CODE
                                                </Typography>
                                            </Grid>
                                            <Grid 
                                                container
                                                item
                                                justify="center"
                                            >
                                                <TextField 
                                                    variant="outlined"
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
                                                    variant="contained"
                                                    startIcon={<MeetingRoomIcon />}
                                                    color="primary"
                                                    size="small"
                                                    onClick={() => {this.setState({roomStatus: true});}}
                                                >   
                                                    Enter Room
                                                </Button>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        }

                        {/* --------------  --------------  -------------- */}
                        {/*                   Meeting Room                 */}
                        {/* --------------  --------------  -------------- */}
                        {
                            !this.state.call && this.state.joinGroupCall && this.state.roomStatus &&
                            <Grid
                                container
                                direction="row"
                                justify="center"
                                alignItems="flex-start"
                                style={{ minHeight: '100vh', background: "url(/wave.svg) no-repeat", backgroundSize: "cover" }}   
                            >
                                <AppBar position="relative">
                                    <Toolbar variant="dense">
                                        <Grid
                                            container
                                            justify="space-between"
                                            alignItems="center"
                                        >
                                            <Grid item>
                                                <Typography
                                                    color="inherit"
                                                    variant="subtitle1"
                                                    style={{ fontFamily: "monospace", fontWeight: "bold", marginLeft: "2vh" }}
                                                >
                                                    AGILE TEAMS
                                                </Typography>
                                            </Grid>
                                            <Grid item>
                                                <Tooltip title="Leave Room">
                                                    <IconButton
                                                        color="inherit"
                                                        onClick={() => {this.setState({roomStatus: false});}}
                                                    >
                                                        <ExitToAppIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </Grid>
                                        </Grid>
                                    </Toolbar>
                                </AppBar>
                                <Grid
                                    container
                                    item
                                    justify="center"
                                    alignItems="center"
                                    style={{ height: "90vh", marginLeft: "2vh", marginRight: "2vh"  }}
                                >
                                    <Paper
                                        elevation={5}
                                        component="span"
                                        style={{ height: "80vh", width: "100vh", padding: "2vh" }}
                                    >
                                        <Grid
                                            container
                                            style={{ background: "linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.7)), url(/chat.png) no-repeat center", backgroundSize: "contain" }}
                                        >
                                            <Grid
                                                container
                                                item
                                                justify="space-between"
                                                alignItems="center"
                                            >
                                                <Grid item>
                                                    <Typography
                                                        color="primary"
                                                        variant="subtitle2"
                                                        style={{ fontFamily: "monospace", fontWeight: "bold" ,marginLeft: "2vh", marginRight: "2vh" }}
                                                    >
                                                        <ChatIcon style={{ marginRight: "1vh" }} />
                                                        GROUP-CHATS
                                                    </Typography>
                                                </Grid>
                                                <Grid item>
                                                    <Tooltip title="Join Meet" >
                                                        <IconButton 
                                                            color="primary" 
                                                            onClick={() => {this.joinGroup(true);}}
                                                        >
                                                            <DuoIcon style={{ fontSize: "4vh" }} />
                                                        </IconButton>
                                                    </Tooltip> 
                                                </Grid>
                                            </Grid>
                                            <Grid
                                                container
                                                item
                                            >
                                               <Chat 
                                                    groupId={this.destinationGroup} 
                                                    displayName={this.state.displayName} 
                                                    isRoom={true}
                                                />   
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid> 
                            </Grid>
                        }

                        {/* --------------  --------------  -------------- */}
                        {/*                    Call Card                   */}
                        {/* --------------  --------------  -------------- */}
                        {
                            this.state.call &&
                            <CallCard
                                groupId={this.destinationGroup}
                                userId={this.state.userId}
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
            </React.Fragment>
        );
    }
}