import {
    isCommunicationUserIdentifier,
    isPhoneNumberIdentifier,
    isMicrosoftTeamsUserIdentifier,
    isUnknownIdentifier
} from '@azure/communication-common';

export const utils = {
    getAppServiceUrl: () => {
        return window.location.origin;
    },
    provisionNewUser: async () => {
        let response = await fetch('/acs-token');

        if(response) {
            return response.json();
        }
        throw new Error('Invalid token response');
    },
    getIdentifierText: (identifier) => {
        if (isCommunicationUserIdentifier(identifier)) {
            return identifier.communicationUserId;
        } else if (isPhoneNumberIdentifier(identifier)) {
            return identifier.phoneNumber;
        } else if (isMicrosoftTeamsUserIdentifier(identifier)) {
            return identifier.microsoftTeamsUserId;
        } else if (isUnknownIdentifier(identifier) && identifier.id === '8:echo123'){
            return 'Echo Bot';
        } else {
            return 'Unknown Identifier';
        }
    },
    getRemoteParticipantObjFromIdentifier(call, identifier) {
        switch(identifier.kind) {
            case 'communicationUser': {
                return call.remoteParticipants.find(rm => {
                    return rm.identifier.communicationUserId === identifier.communicationUserId
                });
            }
            case 'microsoftTeamsUser': {
                return call.remoteParticipants.find(rm => {
                    return rm.identifier.microsoftTeamsUserId === identifier.microsoftTeamsUserId
                });
            }
            case 'phoneNumber': {
                return call.remoteParticipants.find(rm => {
                    return rm.identifier.phoneNumber === identifier.phoneNumber
                });
            }
            default: {
                return call.remoteParticipants.find(rm => {
                    return rm.identifier.id === identifier.id
                });
            }
        }
    }
}
