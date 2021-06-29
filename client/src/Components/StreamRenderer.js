import React from "react";
import { utils } from './Utilities/Utilities';
import { VideoStreamRenderer } from "@azure/communication-calling";
import { Grid, Paper, Typography } from "@material-ui/core";
import { firebaseDatabase } from "./FirebaseConfig";

export default class StreamRenderer extends React.Component {
    constructor(props) {
        super(props);
        this.stream = props.stream;
        this.remoteParticipant = props.remoteParticipant;
        this.componentId = `${utils.getIdentifierText(this.remoteParticipant.identifier)}-${this.stream.mediaStreamType}-${this.stream.id}`;
        this.videoContainerId = this.componentId + '-videoContainer';
        this.renderer = undefined;
        this.view = undefined;
        // this.emojis = ["🙂","😂","😫","😲","😡","😰","🤢","😐","🤣"];
        this.emojis = ["😐","🙂","😂","🤣","😫","😲","😡","😰","🤢"];
        this.state = {
            isSpeaking: false,
            displayName: this.remoteParticipant.displayName?.trim(),
            userExpression: [],
        };
    }

    async componentDidMount() {

        // console.log("!!!"+utils.getIdentifierText(this.remoteParticipant.identifier));
        // console.log("!!! callId"+this.props.callId)
        // console.log("!!! groupId"+this.props.groupId);

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

        this.recieveUserExpression(this.props.groupId, this.props.userId);
    }

    getRenderer() {
        return this.renderer;
    }

    async createRenderer() {
        if (!this.renderer) {
            this.renderer = new VideoStreamRenderer(this.stream);
            this.view = (await this.renderer.createView());
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

    recieveUserExpression(groupId, userId) {
        firebaseDatabase.ref('expression').child(groupId).child(userId).on("value", (snapshot) => {
                this.setState({userExpression: snapshot.val()});
                console.log(this.state.userExpression);
        })
    }

    getEmoji(expression,probability){
        if(expression==='neutral') {
                return this.emojis[0];
        }
        else if(expression==='happy') {
            if(probability==1){
                return this.emojis[3];
            }
            else if (probability>=0.9999){
                return this.emojis[2];
            }
            else {
                return this.emojis[1];
            }
        }
        else if(expression==='sad') {
            return this.emojis[2];
        }
        else if(expression==='surprised') {
            return this.emojis[5];
        }
        else if(expression==='angry') {
            return this.emojis[6];
        }
        else if(expression==='fearful') {
            return this.emojis[7];
        }
        else if(expression==='disgusted') {
            return this.emojis[8];
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
                            {`${String(this.state.displayName).toUpperCase()}`}                           
                        </Typography>
                        <Typography
                            variant="h4"
                            style={{ textAlign: "center" }}    
                        >
                            {
                                this.props.showExpression && !(this.state.userExpression===undefined) && !(this.state.userExpression===null) &&
                                ` ${this.getEmoji(this.state.userExpression.expression,this.state.userExpression.probability)} `
                            } 
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