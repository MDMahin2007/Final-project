import test from 'node:test'
import assert from 'node:assert/strict'

process.env.NETLIFY = 'true'
const { handler } = await import('../netlify/functions/api.js')

test('Netlify function rewrite reaches the Express API health route', async () => {
    const response = await handler({
        path: '/.netlify/functions/api/api/health',
        rawUrl: 'https://smart-campus-clearance.netlify.app/.netlify/functions/api/api/health',
        httpMethod: 'GET',
        headers: { host: 'smart-campus-clearance.netlify.app' },
        queryStringParameters: {},
    }, {})

    assert.equal(response.statusCode, 200)
    assert.deepEqual(JSON.parse(response.body), {
        success: true,
        message: 'ClearPath API is healthy',
    })
})