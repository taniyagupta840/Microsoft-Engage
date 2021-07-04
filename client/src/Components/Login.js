import React from "react";
import { utils } from "./Utilities/Utilities";
import HomePage from "./HomePage";
import { CssBaseline, IconButton, Grid, TextField } from "@material-ui/core";
import AccountCircle from '@material-ui/icons/AccountCircle';
import ArrowForwardIosIcon from '@material-ui/icons/ArrowForwardIos';
import FirebaseAuthentication from "./FirebaseAuthentication";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.userDetailsResponse = undefined;
        this.displayName = undefined;
        this.state = {
            loggedIn: false,
            connect: false,
            isAuthenticated: false
        }
    }

    provisionNewUser = async () => {
        try {
            this.userDetailsResponse = await utils.provisionNewUser();
            this.setState({ id: utils.getIdentifierText(this.userDetailsResponse.user) });
            await this.props.onLoggedIn({ id: this.state.id, token: this.userDetailsResponse.token, displayName: this.displayName });
            this.setState({ loggedIn: true });
        } catch (error) {
            console.log(error);
        } 
    }

    callbackConnect = (isConnect) => {
        this.setState({connect: isConnect});
    }

    callbackAuthentication = (userAuthStatus) => {
        this.setState({ isAuthenticated: userAuthStatus});
    }

    render() {
        return (
            <div>
                <CssBaseline />
                {
                    !this.state.connect && 
                    <HomePage isConnect={this.callbackConnect} />
                }
                {
                    this.state.connect &&
                    <FirebaseAuthentication onAuthentication={this.callbackAuthentication} />
                }
                {   
                    this.state.connect && !this.state.loggedIn && !this.displayName && this.state.isAuthenticated &&
                    <Grid
                        container
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '100vh', overflow: "hidden", background: "url(/Liquid-Cheese.svg) no-repeat", backgroundSize: "cover"  }}
                    >
                        <Grid 
                            container 
                            item
                            direction="row"
                            spacing={1} 
                            alignItems="flex-end"
                            justify="center"
                        >
                            <Grid item >
                                <AccountCircle color="primary" style={{ fontSize:"5vh" }}/>
                            </Grid>
                            <Grid item>
                                <TextField
                                    label="Display-Name" 
                                    size="medium" 
                                    required={true}
                                    onChange={(e) => { this.displayName = e.target.value }}
                                />   
                            </Grid>
                            <Grid item>
                                <IconButton
                                    size="small"
                                    onClick={ () => {this.provisionNewUser();
                                    this.props.callbackDisplayName(this.displayName);} }
                                >
                                    <ArrowForwardIosIcon color="primary" style={{ fontWeight: "bold" }}/>
                                </IconButton>
                            </Grid>
                        </Grid>
                    </Grid>
                }
                {   
                    this.state.connect && !this.state.loggedIn && this.displayName &&
                    <Grid
                    container
                    spacing={0}
                    direction="column"
                    alignItems="center"
                    justify="center"
                    style={{ minHeight: '100vh' }}
                    >
                        <Grid item>
                            <div className="spinner-grow text-primary" role="status"></div>
                            <div className="spinner-grow text-secondary" role="status"></div>
                            <div className="spinner-grow text-success" role="status"></div>
                            <div className="spinner-grow text-danger" role="status"></div>
                            <div className="spinner-grow text-warning" role="status"></div>
                            <div className="spinner-grow text-info" role="status"></div>
                        </Grid>
                    </Grid>
                }
            </div>
        );
    }
}
