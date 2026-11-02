import test from 'node:test'
import assert from 'node:assert/strict'
import { getMongoUri } from '../config/db.js'

const withEnv = (values, callback) => {
    const previous = Object.fromEntries(Object.keys(values).map((key) => [key, process.env[key]]))
    Object.assign(process.env, values)
    try {
        return callback()
    } finally {
        for (const [key, value] of Object.entries(previous)) {
            if (value === undefined) delete process.env[key]
            else process.env[key] = value
        }
    }
}

test('DATABASE_NAME is applied when an Atlas URI omits a database path', () => {
    const uri = withEnv({
        MONGODB_URI: 'mongodb+srv://example:secret@cluster.example.net/',
        MONGO_URI: '',
        DATABASE_NAME: 'clearpath_campus_clearance',
    }, getMongoUri)

    const parsed = new URL(uri)
    assert.equal(parsed.pathname, '/clearpath_campus_clearance')
})

test('an explicit database path in the connection URI is preserved', () => {
    const uri = withEnv({
        MONGODB_URI: 'mongodb+srv://example:secret@cluster.example.net/custom-db',
        MONGO_URI: '',
        DATABASE_NAME: 'ignored-name',
    }, getMongoUri)

    assert.equal(new URL(uri).pathname, '/custom-db')
})