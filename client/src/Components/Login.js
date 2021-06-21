import React from "react";
import { TextField } from 'office-ui-fabric-react'
import { utils } from "./Utilities/Utilities";
import { PrimaryButton, IconButton, Spinner } from "@fluentui/react";
import FirebaseAuthentication from "./FirebaseAuthentication";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.userDetailsResponse = undefined;
        this.displayName = undefined;
        // this.isAuthenticated= false;
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

    callbackAuthentication = (userAuthStatus) => {
        this.setState({ isAuthenticated: userAuthStatus});
    }

    render() {
        return (
            <div className="">
                {
                    !this.state.connect && 
                    <div className="App">
                        <div className="row">
                            <IconButton ariaDescription="Connect" 
                                iconProps={{iconName: 'AddGroup'}}
                                hidden={this.state.connect}
                                onClick={() => this.setState({connect: true})}
                            >
                            </IconButton>
                        </div>
                    </div>
                }
                {
                    this.state.connect &&
                    <FirebaseAuthentication onAuthentication={this.callbackAuthentication} />
                }
                {   
                    this.state.connect && !this.state.loggedIn && !this.displayName && this.state.isAuthenticated &&
                    <div className="App">
                        <div className="row">
                            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6 ms-xxl3">
                                <TextField defaultValue={undefined}
                                    className="mb-3"
                                    size="15"
                                    label="Enter Name (optional)"
                                    onChange={(e) => { this.displayName = e.target.value }}/>
                            </div>
                        </div>
                        <div className="">
                            <PrimaryButton
                                iconProps={{iconName: ''}}
                                text="Submit"
                                onClick={ () => {this.provisionNewUser(); } }>
                            </PrimaryButton>
                        </div>
                    </div>
                }
                {   
                    this.state.connect && !this.state.loggedIn && this.displayName &&
                    <div className="Center">
                        <Spinner label="Loading..." />
                    </div>
                }
            </div>
        );
    }
}
