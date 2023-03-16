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

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.js`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.js`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

