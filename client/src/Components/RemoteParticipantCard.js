import React from "react";
import { utils } from './Utilities/Utilities';
import { Avatar, Badge, CssBaseline, Grid, IconButton, Tooltip } from "@material-ui/core";
import CancelTwoToneIcon from '@material-ui/icons/CancelTwoTone';

export default class RemoteParticipantCard extends React.Component {
    constructor(props) {
        super(props);
        this.call = props.call;
        this.remoteParticipant = props.remoteParticipant;
        this.id = utils.getIdentifierText(this.remoteParticipant.identifier);
        this.avatarColor = ["orange", "pink", "violet", "blue", "purple", "yellowgreen", "skyblue"];
        this.state = {
            isSpeaking: this.remoteParticipant.isSpeaking,
            state: this.remoteParticipant.state,
            isMuted: this.remoteParticipant.isMuted,
            displayName: this.remoteParticipant.displayName?.trim()
        };
    }

    async componentWillMount() {
        this.remoteParticipant.on('isMutedChanged', () => {
            this.setState({ isMuted: this.remoteParticipant.isMuted });
            if (this.remoteParticipant.isMuted) {
                this.setState({ isSpeaking: false });
            }
        });

        this.remoteParticipant.on('stateChanged', () => {
            this.setState({ state: this.remoteParticipant.state });
        });

        this.remoteParticipant.on('isSpeakingChanged', () => {
            this.setState({ isSpeaking: this.remoteParticipant.isSpeaking });
        })

        this.remoteParticipant.on('displayNameChanged', () => {
            this.setState({ displayName: this.remoteParticipant.displayName?.trim() });
        })
    }

    handleRemoveParticipant(e, identifier) {
        e.preventDefault();
        this.call.removeParticipant(identifier).catch((e) => console.error(e))
    }

    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Grid
                    item
                    style={{ margin: "1vh" }}
                >
                    <Badge
                        overlap="circle"
                        anchorOrigin={{
                            vertical: 'top',
                            horizontal: 'left',
                          }}
                        badgeContent={
                            <Tooltip title='Remove'>
                            <IconButton
                                size="small"
                                onClick={ (e) => this.handleRemoveParticipant(e, this.remoteParticipant.identifier) }
                            >
                                <CancelTwoToneIcon fontSize="small" color="secondary" />
                            </IconButton>
                            </Tooltip>
                        }
                    >
                        <Tooltip title={this.state.displayName} >
                        <Avatar 
                            style={{ backgroundColor: this.avatarColor[Math.floor(Math.random()*6)] }}
                        >
                            {String(this.state.displayName).substring(0,1).toUpperCase()}
                        </Avatar>
                        </Tooltip>
                    </Badge>
                </Grid>
            </React.Fragment>
        )
    }
}