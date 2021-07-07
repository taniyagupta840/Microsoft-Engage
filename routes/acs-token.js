var express = require('express');
var router = express.Router();

const CONNECTION_STRING = "endpoint=https://testappvideo.communication.azure.com/;accesskey=HOmnBMdjKb9klRAlgD57StmebR4+jMMf3dvR9mp/yGAoAjMgJjZcefJmH3Cu111QZhRlR42xN9sqFd+roXNsbg==";
const CommunicationIdentityClient = require("@azure/communication-administration").CommunicationIdentityClient;

// generating ACS token
const generateToken = async () => {
    const communicationIdentityClient = new  CommunicationIdentityClient(CONNECTION_STRING);
    let communicationUserId = await communicationIdentityClient.createUser();
    const tokenResponse = await communicationIdentityClient.issueToken(communicationUserId, ["voip"]);

    if(tokenResponse) {
        return tokenResponse;
    }
}

router.get('/', async function(req, res, next) {
    let token = await generateToken();
    // console.log(token);
    res.json(token);
});

module.exports = router;
