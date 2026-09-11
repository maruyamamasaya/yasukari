import type { NextApiRequest, NextApiResponse } from 'next';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { COGNITO_ID_TOKEN_COOKIE, verifyCognitoIdToken } from '../../../lib/cognitoServer';
import { getDocumentClient } from '../../../lib/dynamodb';
import { parseSignupAttribution } from '../../../lib/signupAttribution';

const USER_TABLE = process.env.USER_TABLE ?? 'yasukariUserMain';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const payload = await verifyCognitoIdToken(req.cookies?.[COGNITO_ID_TOKEN_COOKIE]);
    if (!payload) return res.status(401).json({ message: 'Authentication required' });

    const attribution = parseSignupAttribution(req.body);
    if (!attribution) return res.status(400).json({ message: 'utm_source is required' });

    await getDocumentClient().send(
      new UpdateCommand({
        TableName: USER_TABLE,
        Key: { user_id: payload.sub },
        UpdateExpression: [
          'SET signup_source = if_not_exists(signup_source, :source)',
          'signup_campaign = if_not_exists(signup_campaign, :campaign)',
          'signup_medium = if_not_exists(signup_medium, :medium)',
          'signup_content = if_not_exists(signup_content, :content)',
          'signup_term = if_not_exists(signup_term, :term)',
          'signup_at = if_not_exists(signup_at, :signupAt)',
        ].join(', '),
        ExpressionAttributeValues: {
          ':source': attribution.source,
          ':campaign': attribution.campaign ?? '',
          ':medium': attribution.medium ?? '',
          ':content': attribution.content ?? '',
          ':term': attribution.term ?? '',
          ':signupAt': new Date().toISOString(),
        },
      })
    );

    return res.status(200).json({ message: 'Signup attribution stored' });
  } catch (error) {
    console.error('Failed to store signup attribution', error);
    return res.status(500).json({ message: 'Failed to store signup attribution' });
  }
}
