import React from "react";
import { TextField } from 'office-ui-fabric-react'
import { utils } from "./Utilities/Utilities";
import { PrimaryButton, IconButton, Spinner } from "@fluentui/react";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.userDetailsResponse = undefined;
        this.displayName = undefined;
        this.state = {
            loggedIn: false,
            connect: false,
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

    render() {
        return (
            <div className="">
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
                {   this.state.connect && !this.state.loggedIn && !this.displayName &&
                    <div className="App">
                        <div className="row">
                            <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6 ms-xxl3">
                                <TextField defaultValue={undefined}
                                    className="mb-3"
                                    label="Enter Name"
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
                {   this.state.connect && !this.state.loggedIn && this.displayName &&
                    <div className="App">
                        <Spinner label="Loading..." />
                    </div>
                }
            </div>
        );
    }
}
