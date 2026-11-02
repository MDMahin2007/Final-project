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
    const headers = { ...(event.headers || {}) }
    const getHeader = (name) => Object.entries(headers).find(([key]) => key.toLowerCase() === name)?.[1]
    const sourceIp = getHeader('x-nf-client-connection-ip')
        || event.requestContext?.identity?.sourceIp
        || event.requestContext?.http?.sourceIp
        || '127.0.0.1'
    for (const key of Object.keys(headers)) {
        if (key.toLowerCase() === 'x-forwarded-for') delete headers[key]
    }

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