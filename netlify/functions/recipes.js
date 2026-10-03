const https = require('https');

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const query = (event.queryStringParameters && event.queryStringParameters.query) || '';
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'API key not configured' })
    };
  }

  const url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&apiKey=${apiKey}&number=10&addRecipeInformation=true`;

  try {
    const data = await new Promise((resolve, reject) => {
      https.get(url, (apiRes) => {
        let data = '';
        
        apiRes.on('data', (chunk) => {
          data += chunk;
        });
        
        apiRes.on('end', () => {
          try {
            resolve({ status: apiRes.statusCode, body: JSON.parse(data) });
          } catch (error) {
            reject(error);
          }
        });
      }).on('error', reject);
    });

    if (data.status !== 200) {
      return {
        statusCode: data.status,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: data.body.message || 'Recipe service returned an error' })
      };
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data.body)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Failed to fetch recipes' })
    };
  }
};
