import React from "react";
import { utils } from './Utilities/Utilities';
import { VideoStreamRenderer } from "@azure/communication-calling";
import { Grid, Paper, Typography } from "@material-ui/core";

export default class StreamRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.stream = props.stream;
        this.remoteParticipant = props.remoteParticipant;
        this.componentId = `${utils.getIdentifierText(this.remoteParticipant.identifier)}-${this.stream.mediaStreamType}-${this.stream.id}`;
        this.videoContainerId = this.componentId + '-videoContainer';
        this.renderer = undefined;
        this.view = undefined;
        this.state = {
            isSpeaking: false,
            displayName: this.remoteParticipant.displayName?.trim(),
        };
    }

    async componentDidMount() {
        document.getElementById(this.componentId).hidden = true;

        this.remoteParticipant.on('isSpeakingChanged', () => {
            this.setState({ isSpeaking: this.remoteParticipant.isSpeaking });
        });

        this.remoteParticipant.on('isMutedChanged', () => {
            if (this.remoteParticipant.isMuted) {
                this.setState({ isSpeaking: false });
            }
        });
        this.remoteParticipant.on('displayNameChanged', () => {
            this.setState({ displayName: this.remoteParticipant.displayName?.trim() });
        })

        this.stream.on('isAvailableChanged', async () => {
            try {
                if (this.stream.isAvailable && !this.renderer) {
                    await this.createRenderer();
                    this.attachRenderer();
                } else {
                    this.disposeRenderer();
                }
            } catch (e) {
                console.error(e);
            }
        });

        try {
            if (this.stream.isAvailable && !this.renderer) {
                await this.createRenderer();
                this.attachRenderer();
            }
        } catch (e) {
            console.error(e);
        }
    }

    getRenderer() {
        return this.renderer;
    }

    async createRenderer() {
        if (!this.renderer) {
            this.renderer = new VideoStreamRenderer(this.stream);
            this.view = await (await this.renderer.createView());
        } else {
            throw new Error(`[App][StreamMedia][id=${this.stream.id}][createRenderer] stream already has a renderer`);
        }
    }

    async attachRenderer() {
        try {
            if(!this.view.target) {
                throw new Error(`[App][StreamMedia][id=${this.stream.id}][attachRenderer] target is undefined. Must create renderer first`);
            }
            document.getElementById(this.componentId).hidden = false;
            document.getElementById(this.videoContainerId).appendChild(this.view.target);
        } catch (e) {
            console.error(e);
        }
    }

    disposeRenderer() {
        if (this.renderer) {
            this.renderer.dispose();
            this.renderer = undefined;
            document.getElementById(this.componentId).hidden = true;
        } else {
            console.warn(`[App][StreamMedia][id=${this.stream.id}][disposeRender] no renderer to dispose`);
        }
    }

    render() {
        return (
            <Grid
                item
                id={this.componentId}
                xl={4}
                lg={4}
                md={4}
                sm={4}
            >
                {
                    !(this.stream.mediaStreamType === 'ScreenSharing') &&
                    <Paper
                        variant="elevation"
                        elevation={10}
                    >
                        <span id={this.videoContainerId} ></span>
                        <Typography 
                            variant="subtitle2"
                            color="textSecondary"
                            style={{ fontWeight: "bold", textAlign: "center" }}
                        >
                            {String(this.state.displayName).toUpperCase()}
                        </Typography>
                    </Paper>
                }
                                {
                    (this.stream.mediaStreamType === 'ScreenSharing') &&
                    <Paper
                        variant="elevation"
                        elevation={10}
                    >
                        <span id={this.videoContainerId} ></span>
                        <Typography 
                            variant="subtitle2"
                            color="textSecondary"
                            style={{ fontWeight: "bold", textAlign: "center" }}
                        >
                            {`${String(this.state.displayName).toUpperCase()} Screen`}
                        </Typography>
                    </Paper>
                }
            </Grid>
        );
    }
}