import React from 'react';
import { firebaseStorage, firebaseStorageTaskEventSTATE_CHANGED, firebaseStorageTaskStatePAUSED, firebaseStorageTaskStateRUNNING } from './FirebaseConfig';
import { Button, CssBaseline, Dialog, DialogContent, Grid, IconButton, TextField, Tooltip, Typography } from '@material-ui/core';
import FolderSharedIcon from '@material-ui/icons/FolderShared';
import CloudUploadIcon from '@material-ui/icons/CloudUpload';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import AddIcon from '@material-ui/icons/Add';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import ClearIcon from '@material-ui/icons/Clear';

export default class ShareFile extends React.Component {
    constructor(props) {
        super(props);
        
        this.state = {
            openDialog: false,
            PROGRESS_UPLOAD:0,
            FILES_UPLOAD: [],
            SIZE : 5e+6,
            UPLOADED: false,
            URL : '',
            PROGRESS_DOWNLOAD:0,
            FILES_DOWNLOAD:[]
        }
    }

    /**
     * Generate unique password for the uploaded files
     * @returns 
     */
    random = () =>{
        var result = '';
        let chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        result += String(Math.floor(Math.random() * 100) + 1);
        for (var i = 10; i > 0; --i)
            result += chars[Math.floor(Math.random() * chars.length)];
        result += String(Math.floor(Math.random() * 100) + 1);
        // console.log(result);
        return result;
    }

    upload = () =>{
        let len = this.state.FILES_UPLOAD.length;
        if (len === 0){
            try{
                alert("No File Selected");
            }
            catch(err){
                console.log(err);
            }
        }
        else{
            try{
                // console.log("uploading file ");
                const storageRef  = firebaseStorage.ref();
                let folderName = this.random();
                for(let i of this.state.FILES_UPLOAD){
                    this.setState ({PROGRESS_UPLOAD : parseFloat(0)});
                    const fileToUpload = storageRef.child(folderName+'/'+i.name);
                    let uploadTask = fileToUpload.put(i);
                    uploadTask.then(snapshot => {
                        // console.log('File Uploaded Successfully');
                        switch (snapshot.state) {
                            case firebaseStorageTaskStatePAUSED:
                                alert("Sorry, we are facing some problem!!");
                              break;
                            case firebaseStorageTaskStateRUNNING:
                                alert("Sorry, we are facing some problem!!");
                              break;
                            default: break;
                          }
                    });
                    uploadTask.on(firebaseStorageTaskEventSTATE_CHANGED, // or 'state_changed'
                        snapshot => {
                            var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            this.setState ({PROGRESS_UPLOAD : parseFloat(progress)});
                        }, 
                        error => { 
                            alert("Sorry, we are facing some problem!!");
                        },()=>{
                            this.state.FILES_UPLOAD.shift();
                            if(this.state.FILES_UPLOAD.length === 0){
                                this.setState({UPLOADED:true, URL: folderName});
                            }
                        }
                    );
                }    
            }  
            catch(err){
                alert("Sorry, we are facing some problem!!");
            }
            var list = document.getElementById("filedisplaylist");
            var child = list.lastElementChild;  
            while (child) { 
                list.removeChild(child); 
                child = list.lastElementChild; 
            } 
        }
    }

    filepick = () => {
        let input = document.createElement("input");
        input.type="file";
        input.multiple = "multiple";
        input.onchange = e => { 
            var files = e.target.files;
            // console.log(files);
            for(let file of files){
                let size = file.size;
                let oldVal = this.state.SIZE;
                if (oldVal-size>=0 && this.state.FILES_UPLOAD.length<5){
                    this.state.FILES_UPLOAD.push(file);
                    this.setState({SIZE : parseFloat(oldVal)-parseFloat(size)});
                    let list = document.createElement("LI");
                    const FILENAME = String(file.name).substr(0,11);
                    const FILESIZE = String((size/(1e+6)).toFixed(2));
                    let node = document.createTextNode(`${FILENAME}... (${FILESIZE}MB)`);
                    list.appendChild(node);
                    document.getElementById("filedisplaylist").appendChild(list);
                }
                else{
                    alert("Either 5MB limit exceeded or more than 5 files selected!");
                }
            }
        }
        input.click();
    } 

    removeFile = e => {
        let tgt = e.target;
        if (tgt.tagName.toUpperCase() === "LI") {
            let nodes = Array.from( tgt.parentNode.children );
            let index = nodes.indexOf( tgt );
            let file = this.state.FILES_UPLOAD;
            let filesize = file.slice(index,index+1)[0].size;
            file.splice(index,1);
            let oldSize = this.state.SIZE;
            this.setState({SIZE : parseFloat(oldSize)+parseFloat(filesize),FILES_UPLOAD:file});         
            tgt.parentNode.removeChild(tgt); 
        }       
    }

    copy = () =>{
        let url = this.state.URL;
        navigator.clipboard.writeText(url);
    }
    
    download = () => {
        let files = this.state.FILES_DOWNLOAD 
        let len = files.length;
        let step = (100/len).toFixed(10)
        this.setState ({PROGRESS : parseFloat(0)})
        if(len > 0){
            let i;  
            for(i=0;i<len;i++){
                const storageRef  = firebaseStorage.ref();
                var starsRef = storageRef.child(files[i]);
                starsRef.getDownloadURL()
                .then((url) => {
                    let oldval  = this.state.PROGRESS
                    this.setState ({PROGRESS : parseFloat(oldval)+parseFloat(step)})
                    document.getElementById('inputCode').value = '';
                    // console.log(url)
                    let element = document.createElement('a'); 
                    element.setAttribute('href', url); 
                    element.setAttribute('target', "_blank"); 
                    document.body.appendChild(element); 
                    element.click(); 
                    document.body.removeChild(element); 

                }).catch((error) => {
                    alert("Unable to Download File");
                });
            }      
        }
    }

    checkFiles = () => {
        let text = document.getElementById('inputCode').value
        if (text.length>0){
            const storageRef  = firebaseStorage.ref();
            var listRef = storageRef.child(text+"/");
            listRef.listAll().then((res) => {
                res.items.forEach((itemRef) => {
                    this.state.FILES_DOWNLOAD.push(itemRef.fullPath)
                });
            })
            .then(() => {
                if(this.state.FILES_DOWNLOAD.length>0){
                    this.download()
                }
                else{
                    alert("Either the name you Entered is wrong or the item has expired");
                }
            })
            .catch(function(error) {
                alert("We faced some error while searching for your files please try again!!");
            });
        }
        else{
            alert("Enter Unique Code")
        }
    }

    handleDialog = () => {
        this.setState({openDialog: !this.state.openDialog});
    };

    handleClear = () => {
        this.setState({UPLOADED: !this.state.UPLOADED});
    };

    render() {
        return (
            <React.Fragment>
                <CssBaseline />
                <Tooltip title='Share-Files' >
                    <IconButton
                        onClick={this.handleDialog}
                    >
                        <FolderSharedIcon style={{color: "#f4a460"}} />
                    </IconButton>
                </Tooltip>
                <Dialog
                    open={this.state.openDialog}
                    onClose={this.handleDialog}
                    aria-labelledby="Share File Box"
                    maxWidth="md"
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
                            SHARE FILES
                        </Typography>
                    </Grid>
                    <DialogContent
                        style={{ minHeight: "30vh", marginTop:"2vh" }}
                    >
                        {
                            <Grid 
                                container
                                justify="space-between"
                            >
                                <Grid 
                                    item
                                    style={{ width: "35vh" }}
                                    // justify="center"
                                >
                                    <Grid 
                                        container
                                        item
                                        justify="center"
                                    >
                                        <Button
                                            color="primary"
                                            startIcon={<CloudUploadIcon />}
                                            id="upload"
                                            onClick={this.upload}
                                        > 
                                            Upload
                                        </Button>
                                    </Grid>
                                    <Grid
                                        container 
                                        item
                                        justify="center"
                                        style={{ marginTop: "2vh" }}
                                    >
                                        <IconButton
                                            onClick={this.filepick}
                                        >
                                            <AddIcon />
                                        </IconButton>
                                    </Grid>
                                    {
                                        !this.state.UPLOADED &&
                                        <Grid
                                            container 
                                            item
                                            justify="center"
                                        >
                                            <Typography
                                                color= "textSecondary"
                                                variant="body2"
                                                // style={{ overflow:"scroll" }}
                                            >
                                                <span 
                                                    id="filedisplaylist" 
                                                    onClick={this.removeFile}
                                                >
                                                </span>   
                                            </Typography>  
                                        </Grid>
                                    }
                                    {
                                        this.state.UPLOADED && (this.state.URL.length > 0) &&
                                        <Grid
                                            container 
                                            item
                                            justify="center"
                                            alignItems="center"
                                            style={{ padding:"1vh" }}
                                        >
                                            <IconButton
                                                color="secondary"
                                                onClick={this.handleClear}
                                                size="small"
                                            >
                                                <ClearIcon style={{ fontSize: "2.5vh" }} />
                                            </IconButton>  
                                            <Typography
                                                variant="caption"
                                                color= "textSecondary"
                                                style={{ fontWeight:"bold" }}
                                            >
                                                {this.state.URL}   
                                            </Typography>
                                            <IconButton
                                                onClick={ () => {
                                                    this.copy();
                                                }}
                                                size="small"
                                            >
                                                <FileCopyIcon style={{ fontSize: "2.5vh" }} />
                                            </IconButton>  
                                        </Grid>
                                    }
                                </Grid>
                                <Grid 
                                    item
                                    style={{ width: "35vh" }}
                                >
                                    <Grid 
                                        container
                                        item
                                        justify="center"
                                    >
                                        <Button
                                            color="primary"
                                            startIcon={<CloudDownloadIcon />}
                                            id="dowload"
                                            onClick={this.checkFiles}
                                        >
                                            Download  
                                        </Button>
                                    </Grid>
                                    <Grid 
                                        container
                                        item
                                        justify="center"
                                        style={{ marginTop: "2vh" }}
                                    >
                                        <TextField 
                                            variant="outlined"
                                            placeholder="- Enter Unique Code -"
                                            margin="dense"
                                            size="small" 
                                            id="inputCode"
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                        }
                    </DialogContent>
                </Dialog>
            </React.Fragment>
        );
    }
}