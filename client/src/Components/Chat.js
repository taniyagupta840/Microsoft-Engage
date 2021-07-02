import React from 'react';
import { firebaseDatabase } from './FirebaseConfig';
import { Avatar, Chip, CssBaseline, Dialog, DialogActions, DialogContent, Grid, IconButton, TextField, Typography } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/Chat';
import SendIcon from '@material-ui/icons/Send';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.username = this.props.displayName;
        this.groupId = this.props.groupId;
        this.time = undefined;
        this.likedMessageList = [];
        this.state = {
            openDialog: false,
            chat: [],
            message: "",
            sortedChat: [],
        };
    }

    sendMessage(groupId, name, message) {
        var today = new Date();
        var sendMessageBlock = {
            username: name,
            message: message,
            time: today.getHours()+':'+today.getMinutes()+':'+today.getSeconds()+':'+today.getMilliseconds(),
            likeCount: 0,
        }
        firebaseDatabase.ref('teams-chat').child(groupId).push(sendMessageBlock);
    }

    recieveMessage(groupId) {
        firebaseDatabase.ref('teams-chat').child(groupId).limitToLast(20).on('value', (snapshot) => {
            if(!(snapshot.val()===undefined) && !(snapshot.val()===null)) {
                const arr = [];
                Object.keys(snapshot.val()).forEach(function(key) {
                    arr.push({messageId: key, message : snapshot.val()[key]});
                })
                this.setState({chat: arr});
            }
            // console.log(this.state.chat);
        });
    }

    likeUnlikeMessage(groupId, message) {
        if(!this.likedMessageList.includes(message.messageId)) {
            firebaseDatabase.ref('teams-chat').child(groupId).child(message.messageId).child("likeCount").transaction( function(likeCount) {
                return likeCount+1;
            })
            this.likedMessageList.push(message.messageId);
        }
        else {
            firebaseDatabase.ref('teams-chat').child(groupId).child(message.messageId).child("likeCount").transaction( function(likeCount) {
                return likeCount-1;
            })
            this.likedMessageList = this.likedMessageList.filter(e => !(e===message.messageId));
        }
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
                            GROUP CHATS
                        </Typography>
                    </Grid>
                    <DialogContent
                        style={{ overflow: "scroll", height: "40vh" }}
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
                                    label={message.message.username + ": " + message.message.message}
                                    color="primary"
                                />
                                <Typography
                                    variant="overline"
                                    style={{ marginLeft: "1vh" }}
                                >
                                    {message.message.likeCount}
                                </Typography>
                                <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => this.likeUnlikeMessage(this.groupId,message)}
                                >   
                                    {
                                        this.likedMessageList.includes(message.messageId) &&
                                        <ThumbUpIcon 
                                            style={{ fontSize: "2vh" }}
                                        />
                                    }
                                    {
                                        !this.likedMessageList.includes(message.messageId) &&
                                        <ThumbUpIcon 
                                            color="disabled"
                                            style={{ fontSize: "2vh" }}
                                        />
                                    }
                                </IconButton>
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