import { NextApiRequest, NextApiResponse } from 'next';
import { TwitterApi } from 'twitter-api-v2';

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { taskType, verifyData, template } = req.body;

    switch (taskType) {
      case 'TWITTER_FOLLOW':
        const username = verifyData.replace('@', '');
        const following = await client.v2.userFollowers(username);
        return res.status(200).json({ 
          verified: following.data.some(user => user.username === username) 
        });

      case 'TWITTER_REPOST':
        const tweetId = verifyData.split('/').pop()!;
        const retweets = await client.v2.tweetRetweetedBy(tweetId);
        return res.status(200).json({ 
          verified: retweets.data.length > 0 
        });

      case 'TWITTER_TWEET':
        const tweets = await client.v2.userTimeline(verifyData);
        return res.status(200).json({ 
          verified: tweets.data.some(tweet => tweet.text.includes(template)) 
        });

      default:
        return res.status(400).json({ error: 'Invalid task type' });
    }
  } catch (error) {
    console.error('Twitter verification error:', error);
    return res.status(500).json({ error: 'Failed to verify Twitter action' });
  }
} 