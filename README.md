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

# What this is

I'm learning to use React.js (using Next.js) to create a webpage and integrate my dota smurf detection script into a somewhat interactive webpage.


The goal is to make an educated guess onto the amount of smurfs one plays against in their last *n* games with some basic criteria. Not so much an exersize into probability & statistics as it is just to ball park it with some criterea as win %, and number of games as the primary indicators.

You can see my implementation [here](https://github.com/tamaraltahan/GameStats/blob/main/GameStats.py)

### limitations

I am rate limited by the API to 60 calls/minute and given I need to parse 20 matches each with 9 **other** players than the user, I cannot optimize the script to not take... a long time to put it lightly.

Last time I ran my python script it took 15 minutes to finish one function - and 2.5 minutes for another, so yeah...

This is also a learning project for me so there will always be room for improvement and polish to add.