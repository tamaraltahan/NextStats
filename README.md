# What this is

## Elevator pitch

Did a smurf or account buyer just ruin your game? of course they did! Now you're wondering how many smurfs you're constantly playing against, and do I have a solution for you.
With my handy dandy website, we can parse through the data of each player (with a public profile) & make some clever guesses on which players have the most impact in your games! With this python script, we look at the best **and** worst 15% of players and put them into different lists so you can judge for yourself who is actively ruining dota games!


### but no really
I'm learning to use React.js (using Next.js) to create a webpage and integrate my dota smurf detection script into a somewhat interactive webpage.


The goal is to make an educated guess onto the amount of smurfs one plays against in their last 20 games with some basic criteria.
Using some very basic statistics, the python script which I initially developed in frustration over my matches has been refined to lump players outside of 1.5 standard deviations of all parsable players into different lists.
With these revisions I'm not explicitly calling any profiles out, but just lumping them if they're in the best or worst 15% of players from the basis of winrate (as a percent) and total games played.

You can see my previous implementation [here](https://github.com/tamaraltahan/GameStats/blob/main/GameStats.py)

### limitations

The python script uses OpenDota's free API which is rate limited to 60 API calls a minute, 50k/mo so the time to run the script takes a few minutes (between 2.5-5).

This is also a learning project for me so there will always be room for improvement and polish to add.
I've learned front end concept, back end concepts, but merging the two is a new challenge in that now I need both pieces to work together.
Also this is not an area I've spent time working on profesionally, but hope to work with in the future.


Now for the boilerplate Next readme,


This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

`Yarn both` will start the frontent react server & the node/express backend.
`yarn dev` will run the frontend
`node backend.js` runs the backend
**disclaimer**
I'll fix this later, but if you want to start the node server by itself then make sure your terminal is in lowercase ./gamestats/


