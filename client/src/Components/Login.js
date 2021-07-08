import React from "react";
import { utils } from "./Utilities/Utilities";
import HomePage from "./HomePage";
import { CssBaseline, IconButton, Grid, InputAdornment, TextField } from "@material-ui/core";
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

                {/* --------------  --------------  -------------- */}
                {/*                     HomePage                   */}
                {/* --------------  --------------  -------------- */}
                {
                    !this.state.connect && 
                    <HomePage isConnect={this.callbackConnect} />
                }

                {/* --------------  --------------  -------------- */}
                {/*              Firebase Authentication           */}
                {/* --------------  --------------  -------------- */}
                {
                    this.state.connect &&
                    <FirebaseAuthentication onAuthentication={this.callbackAuthentication} />
                }

                {/* --------------  --------------  -------------- */}
                {/*                 Input Username                 */}
                {/* --------------  --------------  -------------- */}
                {   
                    this.state.connect && !this.state.loggedIn && !this.displayName && this.state.isAuthenticated &&
                    <Grid
                        container
                        spacing={0}
                        direction="row"
                        alignItems="center"
                        justify="center"
                        style={{ minHeight: '100vh', overflow: "hidden" }}
                    >
                        <Grid 
                            container 
                            justify="center"
                        >
                            <Grid
                                item
                                container
                                justify="center"
                                alignItems="center"
                                spacing={1}
                            >
                                <Grid item >
                                    <TextField
                                        variant="outlined"
                                        placeholder="Username"
                                        size="small" 
                                        required={true}
                                        onChange={(e) => { this.displayName = e.target.value }}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment>
                                                    <AccountCircle color="primary" style={{ marginRight: "1vh" }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />   
                                </Grid>
                                <Grid item>
                                    <IconButton
                                        color="primary"
                                        onClick={ () => {
                                            if(!(this.displayName===undefined) && !(this.displayName===null))
                                            this.provisionNewUser();
                                            this.props.callbackDisplayName(this.displayName);
                                        } }
                                        >
                                            <ArrowForwardIosIcon color="primary"/>
                                    </IconButton>
                                </Grid>
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
