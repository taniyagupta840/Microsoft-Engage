import React from "react";
import { TextField, PrimaryButton } from 'office-ui-fabric-react'
import { utils } from "./Utilities/Utilities";

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.userDetailsResponse = undefined;
        this.displayName = undefined;
        this.state = {
            showUserProvisioningAndSdkInitializationCode: false,
            showSpinner: false,
            disableInitializeButton: false,
            loggedIn: false
        }
    }

    provisionNewUser = async () => {
        try {
            this.setState({ showSpinner: true, disableInitializeButton: true });
            this.userDetailsResponse = await utils.provisionNewUser();
            this.setState({ id: utils.getIdentifierText(this.userDetailsResponse.user) });
            await this.props.onLoggedIn({ id: this.state.id, token: this.userDetailsResponse.token, displayName: this.displayName });
            this.setState({ loggedIn: true });
        } catch (error) {
            console.log(error);
        } finally {
            this.setState({ disableInitializeButton: false, showSpinner: false });
        }
    }

    render() {
        return (
            <div className="container border p-3">
                <div className="ms-Grid">
                    <div className="row">
                        <h2 className="h4 text-secondary"><b>Generate Access Token</b></h2>
                    </div>
                    {
                        this.state.loggedIn && 
                        <div className="text-dark">
                            <br></br>
                            <div>Generated Provisioned Identity: <span className="identity"><b>{this.state.id}</b></span></div>
                        </div>
                    }
                    {
                        this.state.showSpinner &&
                        <div className="custom-row justify-content-left align-items-center mt-4">
                            <div className="loader"> </div>
                            <div className="ml-2">Fetching token...</div>
                        </div>
                    }
                    {
                        !this.state.loggedIn &&
                        <div>
                            <div className="ms-Grid-row">
                                <div className="ms-Grid-col ms-sm12 ms-lg6 ms-xl6 ms-xxl3">
                                    <TextField className="mt-3"
                                                defaultValue={undefined}
                                                label="Optional display name"
                                                onChange={(e) => { this.displayName = e.target.value }} />
                                </div>
                            </div>
                            <div className="mt-1">
                                <PrimaryButton className="primary-button mt-3"
                                    iconProps={{iconName: 'ReleaseGate', style: {verticalAlign: 'middle', fontSize: 'large'}}}
                                    label="Provision an user" 
                                    disabled={this.state.disableInitializeButton}
                                    onClick={() => this.provisionNewUser()}>
                                        generate
                                </PrimaryButton>
                            </div>
                        </div>
                    }
                </div>
            </div>
        );
    }
}
