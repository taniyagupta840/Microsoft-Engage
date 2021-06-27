import React from 'react';
// import firebase from 'firebase';
import { firebaseDatabase } from './FirebaseConfig';
import { Avatar, Chip, CssBaseline, Dialog, DialogActions, DialogTitle, DialogContent, Divider, Grid, IconButton, TextField, Typography } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import SendIcon from '@material-ui/icons/Send';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.username = this.props.displayName;
        this.groupId = this.props.groupId;
        this.time = undefined;
        this.state = {
            openDialog: false,
            chat:[],
            message: "",
        };
    }

    sendMessage(groupId, name, message) {
        var today = new Date();
        var sendMessageBlock = {
            username: name,
            message: message,
            time: today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+':'+today.getMilliseconds()  
        }
        firebaseDatabase.ref('teams-chat').child(groupId).push(sendMessageBlock);
        console.log("send: "+ sendMessageBlock);
    }

    recieveMessage(groupId) {
        firebaseDatabase.ref('teams-chat').child(groupId).limitToLast(20).on('child_added', (snapshot) => {
            this.setState({chat: [...this.state.chat, snapshot.val()]});
        });
    }

    componentDidMount() {
        this.recieveMessage(this.groupId);
    }

    handleDialog = () => {
        this.setState({openDialog: !this.state.openDialog});
    };

    render() {
        return(
            <React.Fragment>
                <CssBaseline />
                <IconButton
                    onClick={this.handleDialog}
                >
                    <ChatIcon style={{color: "#ff33cc"}} />
                </IconButton>
                <Dialog
                    open={this.state.openDialog}
                    onClose={this.handleDialog}
                    aria-labelledby="Chat Box"
                    maxWidth="xs"
                >
                    <DialogTitle >
                        <Typography 
                            color="textSecondary"
                            style={{ textAlign: "center", fontWeight: "bold" }}
                        >
                            Chats
                        </Typography>
                    </DialogTitle>
                    <Divider variant="middle" />
                    <DialogContent
                        style={{ overflow:"scroll", height:"40vh" }}
                    >
                        <Grid 
                            container
                            spacing={1}
                        >
                        {
                            this.state.chat.map((message) => 
                            <Grid container item>
                                <Chip
                                    size="small"
                                    avatar={<Avatar></Avatar>}
                                    label={message.username + ": " + message.message}
                                    color="primary"
                                />
                            </Grid>
                            )
                        }
                        </Grid>
                    </DialogContent>
                    <DialogActions
                        style={{ paddingLeft:"2vh" }}
                    >
                        <TextField 
                            size="small"
                            variant="standard"
                            style={{ width:"100vh" }}
                            value={this.state.message}
                            onChange={ (e) => this.setState({message: e.target.value}) } 
                        />
                        <IconButton
                            onClick={() => {this.sendMessage(this.groupId,this.username,this.state.message);
                                            this.setState({message: ""});}}
                            color="primary"
                        > 
                            <SendIcon />
                        </IconButton>
                    </DialogActions>
                </Dialog>
            </React.Fragment>
        );
    }
}