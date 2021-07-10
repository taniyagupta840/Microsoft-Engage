import React from 'react';
import { firebaseDatabase } from './FirebaseConfig';
import { Avatar, Chip, CssBaseline, Dialog, DialogActions, DialogContent, Grid, IconButton, InputAdornment, Paper, TextField, Tooltip, Typography } from '@material-ui/core';
import Picker from 'emoji-picker-react';
import ChatIcon from '@material-ui/icons/Chat';
import SendIcon from '@material-ui/icons/Send';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import EmojiEmotionsIcon from '@material-ui/icons/EmojiEmotions';

export default class Chat extends React.Component {
    constructor(props) {
        super(props);
        this.username = this.props.displayName;
        this.groupId = this.props.groupId;
        this.time = undefined;
        this.likedMessageList = [];
        this.state = {
            openDialog: false,
            openEmojiDialog: false,
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

    onEmojiClick = (event, emojiObject) => {
        this.setState({message: this.state.message+emojiObject.emoji});
    };

    handleEmojiDialog = () => {
        this.setState({openEmojiDialog: !this.state.openEmojiDialog});
    };

    render() {
        return(
            <React.Fragment>
                <CssBaseline />

                {/* --------------  --------------  -------------- */}
                {/*                 Meet Group Chat                */}
                {/* --------------  --------------  -------------- */}
                {
                    !this.props.isRoom &&
                    <div>
                        <Tooltip title='Group-Chat' >
                            <IconButton
                                onClick={this.handleDialog}
                            >
                                <ChatIcon style={{color: "#ff33cc"}} />
                            </IconButton>
                        </Tooltip> 
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
                            style={{ height: "40vh" }}
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
                                <Dialog
                                    open={this.state.openEmojiDialog}
                                    onClose={this.handleEmojiDialog}
                                    aria-labelledby="Chat Box"
                                >
                                    <Picker onEmojiClick={this.onEmojiClick} />
                                </Dialog>
                            </Grid>
                        </DialogContent>
                        <DialogActions>
                            <Paper
                                    elevation={5}
                                    style={{ width: "80vh" }}
                            >
                            <TextField
                                    size="medium"
                                    fullWidth
                                    variant="standard"
                                    value={this.state.message}
                                    onChange={ (e) => this.setState({message: e.target.value}) }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment>
                                                <Tooltip title="Emoji" >
                                                    <IconButton
                                                        onClick={this.handleEmojiDialog}
                                                        color="primary"
                                                        size="small"
                                                    > 
                                                        <EmojiEmotionsIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <Tooltip title="Send" >
                                                <IconButton
                                                    onClick={() => {this.sendMessage(this.groupId,this.username,this.state.message);
                                                                    this.setState({message: ""});}}
                                                    color="primary"
                                                    size="small"
                                                > 
                                                    <SendIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    }}
                                />
                            </Paper>
                        </DialogActions>
                    </Dialog>
                    </div>
                }

                {/* --------------  --------------  -------------- */}
                {/*                 Room Group Chat                */}
                {/* --------------  --------------  -------------- */}
                {
                    this.props.isRoom &&
                        <React.Fragment>
                            <Grid
                                container
                                item
                                justify="center"
                                alignItems="flex-start"
                                style={{ height: "60vh", marginBottom: "2vh"  }}
                            >
                                <Grid
                                    container
                                    item
                                    direction="row"
                                    alignItems="flex-start"
                                    justify="flex-start"
                                    style={{ padding: "1vh"}}
                                >
                                    {
                                        this.state.chat.map((message) => 
                                        <Grid 
                                            container
                                            item
                                            alignItems="center"
                                            justify="flex-start"
                                        >
                                            <Grid item>
                                                <Chip
                                                    size="small"
                                                    avatar={<Avatar></Avatar>}
                                                    label={message.message.username + ": " + message.message.message}
                                                    color="primary"
                                                />
                                            </Grid>
                                            <Grid item>
                                                <Typography
                                                    variant="overline"
                                                    style={{ marginLeft: "1vh" }}
                                                >
                                                    {message.message.likeCount}
                                                </Typography>
                                            </Grid>
                                            <Grid item>
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
                                        </Grid>
                                        )
                                    }
                                </Grid>
                                <Dialog
                                    open={this.state.openEmojiDialog}
                                    onClose={this.handleEmojiDialog}
                                    aria-labelledby="Chat Box"
                                >
                                    <Picker onEmojiClick={this.onEmojiClick} />
                                </Dialog>
                            </Grid>
                            <Grid 
                                container
                                item
                                justify="center"
                                alignItems="center"
                            >
                                <Paper
                                    elevation={5}
                                    style={{ width: "80vh" }}
                                >
                                <TextField
                                    size="medium"
                                    fullWidth
                                    variant="standard"
                                    value={this.state.message}
                                    onChange={ (e) => this.setState({message: e.target.value}) }
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment>
                                                <Tooltip title="Emoji" >
                                                    <IconButton
                                                        onClick={this.handleEmojiDialog}
                                                        color="primary"
                                                        size="small"
                                                    > 
                                                        <EmojiEmotionsIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </InputAdornment>
                                        ),
                                        endAdornment: (
                                            <Tooltip title="Send" >
                                                <IconButton
                                                    onClick={() => {this.sendMessage(this.groupId,this.username,this.state.message);
                                                                    this.setState({message: ""});}}
                                                    color="primary"
                                                    size="small"
                                                > 
                                                    <SendIcon />
                                                </IconButton>
                                            </Tooltip>
                                        )
                                    }}
                                />
                                </Paper>
                            </Grid>
                        </React.Fragment>
                }
            </React.Fragment>
        );
    }
}