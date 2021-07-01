> # Microsoft-Engage

__Microsoft Engage' 21 - Teams Clone__

__Live -__ [agile-teams-clone.herokuapp.com](agile-teams-clone.herokuapp.com)

__Developer -__ <code><b>Umang Barthwal</b></code>

___

#### Features

- Responsive
- Interactive Homepage Theme
- Firebase Authentication (via google/email)
- Display Name
- Unique Join Code Generator
- Copy Join Code on a Click
- Camera Selector (auto/manual)
- Microphone Selector (auto/manual)
- Speaker Selector (auto/manual)
- Video on/off
- Local Video Preview
- Auto Adjusting Video Tiles
- Audio on/off
- Call Hangup
- Screen-Share
- File-Sharing Support
- Add Upto 5 Files (in one go)
- File Upto 5 MB (in one go)
- Remove Listed File on a Click
- File Access Token to Download Shared File
- Group Chat Support
- Participant's Avatar
- Remove Participants Support
- AI based Face Expression Detector
- Like/Unlike Chat Message

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

###### Tools & Technologies
- Node.js: Backend Server
- React: Frontend Server
- Azure Communication Services: End-Points for Video Calling
- Firebase Authentication: Google & Email Athentication
- Firebase Storage: File-Sharing Feature
- Firebase Database: Chat Feature
- Heruko-Hosting: Web-app Hosting
- FluentUI Fabric: Design
- Bootstrap: Design
- Material UI: Design
- UUID Generator: Unique Join ID 
- Vanta.js: Background Animation
- Face-API: Processing Trained-Models
- Tiny-Face-Detector Model: Trained Face Model
- Face-Expression-Model: Trained Expression Model

___

#### Challenges

- React - Totally newbie
- UI/UX
- Video-Stream Representation ( still persist )
- Lifting-Up State in React
- Not able to catch updated messages in React state
- Input video stream to Face api AI model and optimisation

___

#### Resources

- www.microsoft.acehacker.com
- www.docs.microsoft.com
- www.stackoverflow.com
- www.medium.com
- www.material-ui.com
- www.w3schools.com
- www.vantajs.com
- https://firebase.google.com/docs/database/web/read-and-write
- https://justadudewhohacks.github.io/face-api.js/face_and_landmark_detection/

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
- <b> june 24, 2021 - </b> add animated background on homepage.
- <b> june 25, 2021 - </b> start chat development.
- <b> june 26, 2021 - </b> add chat & code optimization.
- <b> june 27, 2021 - </b> add participant avatar & remove-participants functionality.
- <b> june 28, 2021 - </b> integrate face detection and expression detection model.
- <b> june 29, 2021 - </b> integrate emoji representation of expression data.
- <b> june 30, 2021 - </b> code optimisation & minetest deployment.
- <b> july 1, 2021 - </b> add like/unlike feature in chats.