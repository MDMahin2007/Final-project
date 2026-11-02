import serverless from 'serverless-http'

const functionPrefix = '/.netlify/functions/api'
let expressHandlerPromise

export const handler = async (event, context) => {
    if (context) context.callbackWaitsForEmptyEventLoop = false
    if (!expressHandlerPromise) {
        process.env.NETLIFY = 'true'
        expressHandlerPromise = import('../../server.js').then(({ default: app }) => serverless(app))
    }
    const expressHandler = await expressHandlerPromise
    const incomingPath = event.path || '/'
    const prefixIndex = incomingPath.indexOf(functionPrefix)
    const requestPath = prefixIndex >= 0
        ? incomingPath.slice(prefixIndex + functionPrefix.length) || '/'
        : incomingPath
    const requestUrl = new URL(event.rawUrl || `https://${event.headers?.host || 'localhost'}${incomingPath}`)
    requestUrl.pathname = requestPath
    const headers = event.headers || {}
    const forwardedIp = headers['x-nf-client-connection-ip'] || headers['X-Nf-Client-Connection-Ip']
    const sourceIp = forwardedIp || headers['x-forwarded-for']?.split(',')[0]?.trim() || '127.0.0.1'

    return expressHandler({
        ...event,
        headers,
        body: event.body ?? '',
        path: requestPath,
        rawUrl: requestUrl.toString(),
        requestContext: {
            ...event.requestContext,
            identity: {
                ...event.requestContext?.identity,
                sourceIp,
            },
        },
    }, context)
}