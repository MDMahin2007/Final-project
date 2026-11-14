import test from 'node:test'
import assert from 'node:assert/strict'
import serverless from 'serverless-http'

process.env.NETLIFY = 'true'
process.env.CLIENT_URL = 'https://smart-campus-clearance.vercel.app'

const { default: app } = await import('../server.js')
const handler = serverless(app)

test('the Express API health route responds successfully', async () => {
    const response = await handler({
        httpMethod: 'GET',
        path: '/api/health',
        headers: { host: 'localhost' },
        requestContext: { identity: { sourceIp: '127.0.0.1' } },
        queryStringParameters: {},
    }, {})

    assert.equal(response.statusCode, 200)
    assert.deepEqual(JSON.parse(response.body), {
        success: true,
        message: 'ClearPath API is healthy',
    })
})

test('CORS preflight allows the deployed Vercel frontend', async () => {
    const response = await handler({
        httpMethod: 'OPTIONS',
        path: '/api/auth/login',
        headers: {
            host: 'localhost',
            Origin: 'https://frontend-psi-gold-71.vercel.app',
            'access-control-request-method': 'POST',
            'access-control-request-headers': 'authorization,content-type',
        },
        requestContext: { identity: { sourceIp: '127.0.0.1' } },
        queryStringParameters: {},
    }, {})

    assert.equal(response.statusCode, 204)
    assert.equal(response.headers['access-control-allow-origin'], 'https://frontend-psi-gold-71.vercel.app')
    assert.match(response.headers['access-control-allow-methods'], /POST/)
})
