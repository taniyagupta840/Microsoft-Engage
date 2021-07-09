> # Microsoft-Engage

__Microsoft Engage' 21 - Agile Teams__

__Live-1 -__ [https://agile-teams.minetest.in](https://agile-teams.minetest.in)

__Live-2 -__ [https://agile-teams-clone.herokuapp.com](https://agile-teams-clone.herokuapp.com)

__Mentor -__ <code><b>Achal Gupta</b></code> <br/>
__Mentee -__ <code><b>Umang Barthwal</b></code>


___

#### Agile Teams Sprints
![gif](/docs/AgileSprints.gif)


___

#### Features

1. Responsive
2. Interactive Homepage Theme
3. Tooltips for Buttons/Avatar
4. Firebase Authentication (via google/email)
5. Multi-User Video Call
6. Unique Join Code Generator
7. Copy Join Code on a Click
8. Camera Selector (auto/manual)
9. Microphone Selector (auto/manual)
10. Speaker Selector (auto/manual)
11. Video on/off
12. Local Video Preview
13. Auto Adjusting Video Tiles
14. Audio on/off
15. Call Hangup
16. Screen-Share
17. File-Sharing Support
18. Add Upto 5 Files (in one go)
19. File Upto 5 MB (in one go)
20. Remove Listed File on a Click
21. File Access Token to Download Shared File
22. Group Chat Support
23. Participant's Avatar
24. Remove Participants Support
25. AI based Face Expression Detector
26. Like/Unlike Chat Message
27. Participants Mic Status (Muted/Unmuted/Speaking)
28. Emoji Picker
29. Chat Room
30. Group Chat access before/after Meet

___

#### Setup Instructions

###### Prerequisites
- Node + npm
- React

###### Development Setup
- Clone the Repository
- Setup Backend-Server
 <code>npm install</code>
 <code>npm start</code>


- Setup React-Server
 <code>cd client</code>
 <code>npm install</code>
 <code>npm start</code>

- Open-Browser
 <code>http://localhost:3000</code>


 ###### Production Setup
 - <code>cd Microsoft-Engage</code>
 - <code>npm run heroku-postbuild</code>

###### Tools & Technologies

| `Tools & Technologies`        | `Usage`                     |
|:--------------------------: | :--------------------------:|
|Azure Communication Services|End-Points for Video Calling| 
|Bootstrap 5|Design|
|Emoji-picker-react|Emojis|
|Face-api.js|Processing Trained-Models|
|Face-Expression-Model|Trained Expression Model|
|Firebase Authentication|Google & Email Athentication|
|Firebase Database|Chat Feature & Face-Expression Detection|
|Firebase Storage|File-Sharing Feature|
|FluentUI Fabric|Design|
|Heruko-Hosting|Web-app Hosting|
|Material UI|Design|
|Minetest-Hosting|Web-app Hosting|
|Node.js|Backend|
|React|Frontend|   
|Tiny-Face-Detector Model|Trained Face Model|
|UUID Generator|Unique Join ID |
|Vanta.js|Background Animation|

___

#### Documentation

###### Components

- __Node.js & Express__
 The project uses a node environment and express server at the backend. Express server running on http://localhost:5000.

- __React.js__ 
The project uses React.js for serving the client-end. React server running on http://localhost:3000. Client-end is linked to the backend using the proxy.

- __APIs__
    1. /acs-token: Returns the generated ACS (Azure Communication Services) Token.
	2. /generate-uuid: Return UUID.

- __HomePage__
React Component for the homepage of the project. It uses Vanta.js for interactive Bird Animation background.

- __FirebaseAuthentication__
React Component to authenticate the users using firebase authentication. Google authentication & Email authentication options are available.

- __MakeCall__
React Component uses the ACS Token to establish the connection between the user and Azure Communication Services.

- __CallCard__
React Component uses the UUID to start the meet. It handles all the functionalities related to the video call, such as camera toggle, microphone toggle, screen-share etc.

- __RemoteParticipantCard__
React Component to create an avatar of each participant and functionality to remove the participant from the meet.

- __LocalVideoPreviewCard__
React Component uses the device camera to stream local video. It also contains face detection & expression detection models to detect user's facial expressions and confidence probability.

- __StreamRenderer__
React Component to render the video streams of the remote participants & preview in the form of dynamically adjustable tiles. It also has the functionality to process the remote participant's expression & expression probability and map it to the right emoji.

- __ShareFile__
React Component to share files. There is a limit of a total of 5 MB and up to 5 files at a time. Shared files can be accessed by other participants using the unique code generated after the upload.

- __Chat__
React Component to provide group chat functionality. Users can access the chat before/after joining the meet. It has features like adding emojis and liking others messages.

###### Code Flow Before Adapt Stage

![picture](/docs/BeforeAdapt.png)

###### Code Flow After Adapt Stage
![picture](/docs/AfterAdapt.png)


___

#### Challenges Faced

- React
- UI/UX
- Video-Stream Representation
- Lifting-Up State in React
- Not able to catch updated messages in React state
- Input video stream to Face api AI model and optimisation
- Adapt feature


___

#### Resources Used

- www.microsoft.acehacker.com
- www.docs.microsoft.com
- www.stackoverflow.com
- www.medium.com
- www.material-ui.com
- www.w3schools.com
- www.vantajs.com
- https://firebase.google.com/docs/database/web/read-and-write
- https://justadudewhohacks.github.io/face-api.js/face_and_landmark_detection/
- https://www.npmjs.com/package/emoji-picker-react

___

#### Daily Logs
- <b> june 14, 2021 - </b> setup react + express app and deployed on Heroku.
- <b> june 15, 2021 - </b> create & integrate acs-token api + login-ui development.
- <b> june 16, 2021 - </b> add local video stream and video/audio/hangup functionalities.
- <b> june 17, 2021 - </b> add remote video stream and video/audio/hangup functionalities.
- <b> june 18, 2021 - </b> add bootstrap cards to render video streams.
- <b> june 19, 2021 - </b> create uuid-generator api.
- <b> june 20, 2021 - </b> integrate uuid-generator functionality.
- <b> june 21, 2021 - </b> add firebase authentication.
- <b> june 22, 2021 - </b> add setting panel & major ui changes using Material UI.
- <b> june 23, 2021 - </b> change firebase configration & add file sharing functionality.
- <b> june 24, 2021 - </b> add animated background on homepage & file sharing functionality.
- <b> june 25, 2021 - </b> start chat development.
- <b> june 26, 2021 - </b> add chat & code optimization.
- <b> june 27, 2021 - </b> add participant avatar & remove-participants functionality.
- <b> june 28, 2021 - </b> integrate face detection and expression detection model.
- <b> june 29, 2021 - </b> integrate emoji representation of expression data.
- <b> june 30, 2021 - </b> code optimisation & minetest deployment.
- <b> july 1, 2021 - </b> add like/unlike feature in chats.
- <b> july 2, 2021 - </b> add svg background.
- <b> july 3, 2021 - </b> add tooltips on buttons/avatar.
- <b> july 4, 2021 - </b> add participant's mic-status & bug fixing.
- <b> july 5, 2021 - </b> plan the integration of adapt feature.
- <b> july 6, 2021 - </b> add room & chat functionality before the meet.
- <b> july 7, 2021 - </b> restructure the room.
- <b> july 8, 2021 - </b> debug & UI enhancement.