import test from 'node:test'
import assert from 'node:assert/strict'

process.env.NETLIFY = 'true'
process.env.CLIENT_URL = 'https://smart-campus-clearance.vercel.app'
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

test('Netlify OPTIONS preflight allows the deployed Vercel frontend', async () => {
    const response = await handler({
        path: '/.netlify/functions/api/api/auth/register',
        rawUrl: 'https://smart-campus-clearance.netlify.app/.netlify/functions/api/api/auth/register',
        httpMethod: 'OPTIONS',
        headers: {
            host: 'smart-campus-clearance.netlify.app',
            origin: 'https://smart-campus-clearance.vercel.app',
            'access-control-request-method': 'POST',
            'access-control-request-headers': 'authorization,content-type',
        },
        queryStringParameters: {},
    }, {})

    assert.equal(response.statusCode, 204)
    assert.equal(response.headers['access-control-allow-origin'], 'https://smart-campus-clearance.vercel.app')
    assert.match(response.headers['access-control-allow-methods'], /POST/)
})