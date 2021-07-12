>  # Agile Teams

<img src="https://avatars.githubusercontent.com/u/6154722?s=200&v=4" height="15px" /> __Microsoft Engage' 21 - Agile Teams__

__Live-1 -__ [https://agile-teams.minetest.in](https://agile-teams.minetest.in)

__Live-2 -__ [https://agile-teams.herokuapp.com](https://agile-teams.herokuapp.com)

__Mentor -__ <code><b>Achal Gupta</b></code> <br/>
__Mentee -__ <code><b>Umang Barthwal</b></code>


____


#### 🏷️ Table of Contents  
* **[Overview](#overview)**
* **[Sprints](#sprints)** 
* **[Features](#features)**
* **[Setup Instructions](#setupInstructions)**
    * **[Prerequisites](#prerequisites)**
    * **[Development Setup](#developmentSetup)**
    * **[Production Setup](#productionSetup)**
* **[Tools, Technologies & Libraries](#tools&Technologies)**
* **[Documentation](#documentation)**
    * **[Components](#components)**
        * **[Node.js & Express](#node.js&Express)**
        * **[React.js](#react.js)**
        * **[APIs](#apis)**
        * **[HomePage](#homePage)**
        * **[FirebaseAuthentication](#firebaseAuthentication)**
        * **[MakeCall](#makeCall)**
        * **[CallCard](#callCard)**
        * **[RemoteParticipantCard](#remoteParticipantCard)**
        * **[LocalVideoPreviewCard](#localVideoPreviewCard)**
        * **[StreamRenderer](#streamRenderer)**
        * **[ShareFile](#shareFile)**
        * **[Chat](#chat)**
    * **[Code Flow](#codeFlow)**
* **[Challenges Faced](#challengesFaced)**
* **[Resources Used](#resourcesUsed)**
* **[Daily Logs](#dailyLogs)**
  

___


<a name="overview"></a>
#### 📄 Overview

**Agile Teams** is a single-page meeting web app. Users can organise group video calls by sharing unique meet codes. Users can access group chats before the meet starts and after the meet get over. Agile Teams is packed with many essential and fancy features, like chat, file sharing, screen share, facial expression detection, etc. <br />
**Agile Teams connecting worlds! 🌏**


___


<a name="sprints"></a>
#### 🏃 Sprints
**Agile Teams** adopts the Agile mindset to deal with the uncertain and turbulent environment of the Engage Mentorship Program. Agile Teams followed an incremental development approach due to the short period of the program and the pressure of adapting to the new features. A sprint of two to three days performed, where the goal of each sprint is to build essential elements first and come out with a working prototype. More features are built into the project in subsequent sprints and are adjusted based on the mentor's and fellow's feedback between sprints. <br />
![gif](/docs/AgileSprints.gif)


___


<a name="features"></a>
#### 🔷 Features

1. Responsive Web-Application
1. Interactive Homepage Theme
3. Tooltips for Buttons & Avatars
4. Firebase Authentication (via google/email)
5. Multi-User Video Call
6. Unique Meet Code Generator
1. Share Meet Code via Email
7. Copy Meet Code on a Click
8. Camera Selector (auto/manual)
9. Microphone Selector (auto/manual)
10. Speaker Selector (auto/manual)
11. Video on/off
12. Local Video Preview (inside settings)
13. Auto Adjusting Video Tiles (using grids & paper component of material UI)
14. Audio on/off
15. Call Hangup
16. Screen-Share
17. **File-Sharing Functionality**
18. Add Upto 5 Files (in one selection | editable)
19. File Upto 5 MB (in one selection | editable)
20. Remove Listed File on a Click
21. Unique File Access Token to Download the Shared File
22. Group Chat Functionality
23. Participant's Avatar
24. Remove Participants on a Click
25. **AI based Face Expression Detector**
26. Like/Unlike Chat Message
27. Participants Mic Status (Muted/Unmuted/Speaking)
28. Emoji Picker
30. Group Chat access before/after Meet


___


<a name="setupInstructions"></a>
#### ⚙️ Setup Instructions

<a name="prerequisites"></a>
###### Prerequisites
- Node + npm
- React

<a name="developmentSetup"></a>
###### Development Setup
* Clone the Repository
* Setup Backend-Server
    * <code>npm install</code>
    * <code>npm start</code>


* Setup React-Server <br />
    * <code>cd client</code> <br />
    * <code>npm install</code> <br />
    * <code>npm start</code>

- Open-Browser <br />
    * <code>http://localhost:3000</code>

<a name="productionSetup"></a>
 ###### Production Setup
 - <code>cd Microsoft-Engage</code>
 - <code>npm run heroku-postbuild</code>


 ___


<a name="tools&Technologies"></a>
####  🛠 Tools, Technologies & Libraries

| Tools, Technologies & Libraries        | Usage                     |
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


<a name="documentation"></a>
#### 📄 Documentation

<a name="components"></a>
###### Components

<a name="node.js&Express"></a>
- __Node.js & Express:__
 The project uses a node environment and express server at the backend. Express server running on http://localhost:5000.

<a name="react.js"></a>
- __React.js:__ 
The project uses React.js for serving the client-end. React server running on http://localhost:3000. Client-end is linked to the backend using the proxy.


<a name="apis"></a>
- __APIs:__
    1. /acs-token: Returns the generated ACS (Azure Communication Services) Token.
	2. /generate-uuid: Return UUID.

<a name="homePage"></a>
- __HomePage:__
React Component for the homepage of the project. It uses Vanta.js for interactive Bird Animation background. <br/>
`Home Page`
![gif](/docs/HomePage.gif)

<a name="firebaseAuthentication"></a>
- __FirebaseAuthentication:__
React Component to authenticate the users using firebase authentication. Google authentication & Email authentication options are available. <br/>
`Firebase Authetication Page`
![picture](/docs/FirebaseAuth.png)

<a name="makeCall"></a>
- __MakeCall:__
React Component uses the ACS Token to establish the connection between the user and Azure Communication Services. <br/>
`Username Page`
![picture](/docs/UsernamePage.png)
`Create Meet or Join Room`
![gif](/docs/CreateJoinMeetPage.gif)
`Create Meet`
![picture](/docs/GeneratedMeetingCodePage.png)
`Join Room`
![picture](/docs/EnterJoiningCodePage.png)

<a name="callCard"></a>
- __CallCard:__
React Component uses the UUID to start the meet. It handles all the functionalities related to the video call, such as camera toggle, microphone toggle, screen-share etc. <br />
`Meet Window`
![picture](/docs/MeetWindow.png)
`Screen Share`
![picture](/docs/ScreenShare.png)

<a name="remoteParticipantCard"></a>
- __RemoteParticipantCard:__
React Component to create an avatar of each participant and functionality to remove the participant from the meet. <br />
`Avatar`
![picture](/docs/Avatar.png)

<a name="localVideoPreviewCard"></a>
- __LocalVideoPreviewCard:__
React Component uses the device camera to stream local video. It also contains face detection & expression detection models to detect user's facial expressions and confidence probability. <br />
`Settings`
![picture](/docs/Settings.png)

<a name="streamRenderer"></a>
- __StreamRenderer:__
React Component to render the video streams of the remote participants & preview in the form of dynamically adjustable tiles. It also has the functionality to process the remote participant's expression & expression probability and map it to the right emoji. <br />
`Expression Detection`
![picture](/docs/ExpressionDetection2.png)
![picture](/docs/ExpressionDetection1.png)

<a name="shareFile"></a>
- __ShareFile:__
React Component to share files. There is a limit of a total of 5 MB and up to 5 files at a time. Shared files can be accessed by other participants using the unique code generated after the upload. <br/>
`Share File Dialog`
![picture](/docs/FileShare.png)

<a name="chat"></a>
- __Chat:__
React Component to provide group chat functionality. Users can access the chat before/after joining the meet. It has features like adding emojis and liking others messages. <br/>
`Agile Teams - Room Group Chat`
![picture](/docs/RoomChat.png)
`Agile Teams - Meet Group Chat`
![picture](/docs/MeetChat.png)


<a name="codeFlow"></a>
###### Code Flow

| Before Adapt Stage | After Adapt Stage |
|:--------------------------: | :--------------------------:|
| ![picture](/docs/BeforeAdapt.png) | ![picture](/docs/AfterAdapt.png) | 


___


<a name="challengesFaced"></a>
#### 🤼 Challenges Faced

- UI/UX
- Video-Stream Representation
- Lifting-Up State in React
- Not able to catch updated messages in React state
- Input video stream to Face api AI model and optimisation
- Adapt feature


___


<a name="resourcesUsed"></a>
#### 📚 Resources Used

- https://www.microsoft.acehacker.com
- https://docs.microsoft.com/en-us/azure/communication-services/overview
- https://www.stackoverflow.com
- https://www.medium.com
- https://www.material-ui.com
- https://www.w3schools.com
- https://www.vantajs.com
- https://firebase.google.com/docs/database/web/read-and-write
- https://justadudewhohacks.github.io/face-api.js/face_and_landmark_detection/
- https://www.npmjs.com/package/emoji-picker-react
- https://loading.io
- https://github.com/adam-p/markdown-here/wiki/Markdown-Cheatsheet


___


<a name="dailyLogs"></a>
#### 🏡 Daily Logs
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
- <b> july 9, 2021 - </b> add documentation & illustrations.
- <b> july 10, 2021 - </b> add documentation & bug fixing.
- <b> july 11, 2021 - </b> video demo.
- <b> july 12, 2021 - </b> video demo.