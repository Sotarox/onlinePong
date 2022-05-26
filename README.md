# 4 players online pong

## Web application demo
https://onlinepong.herokuapp.com  
- Choose a room and play pong game.
- Players in the same room can play and chat together.
- Press `<-` and `->` keys in keyboard to move your paddle.
- Smartphone and Tablet are currently not supported.

## Dev environment
This App is developped by:

- Mac OSX
- Node.js 16.11.1
- npm 8.0.0

## How to run in your local pc
When you try to understand how does it work, clone this project by `git clone`.

Then do the followings in a console:
- Move to project root folder
```
cd onlinePong
```
- Install dependencies
```
npm install
```
- Run Node
```
node server.js
```
- Open a browser, type in url `localhost:8080`

## Run by container
Instead of building locally, the app can run in a docker container.  
As a prerequisity, you need to download [Docker Desktop](https://docs.docker.com/get-docker/) beforehand.  
Type the following in the project root folder (=`onlinePong`):  
```
docker compose up
```
Then open a browser, type in url `localhost:8080`