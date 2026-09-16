export const handler = async (event) => {
  try {
    const { user = {} } = JSON.parse(event.body || '{}');
    return {
      statusCode: 200,
      body: JSON.stringify({
        app_metadata: {
          ...(user.app_metadata || {}),
          roles: ['student'],
        },
      }),
    };
  } catch (error) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
