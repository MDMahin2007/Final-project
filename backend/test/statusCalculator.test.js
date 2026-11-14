import test from 'node:test'
import assert from 'node:assert/strict'
import { calculateRequestStatus, isApprovalReady } from '../utils/statusCalculator.js'

test('a request with no decisions stays pending', () => {
    assert.equal(calculateRequestStatus([]), 'PENDING')
    assert.equal(calculateRequestStatus([{ status: 'PENDING' }, { status: 'PENDING' }]), 'PENDING')
})

test('a partial approval moves the request in progress', () => {
    assert.equal(calculateRequestStatus([{ status: 'APPROVED' }, { status: 'PENDING' }]), 'IN_PROGRESS')
})

test('any rejection takes priority', () => {
    assert.equal(calculateRequestStatus([{ status: 'APPROVED' }, { status: 'REJECTED' }, { status: 'PENDING' }]), 'REJECTED')
})

test('the request clears only after every office approves', () => {
    assert.equal(calculateRequestStatus([{ status: 'APPROVED' }, { status: 'APPROVED' }]), 'CLEARED')
})

test('an office can review only after each earlier office approves', () => {
    const target = { stepOrder: 3 }
    assert.equal(isApprovalReady(target, [
        { stepOrder: 1, status: 'APPROVED' },
        { stepOrder: 2, status: 'APPROVED' },
        target,
    ]), true)
    assert.equal(isApprovalReady(target, [
        { stepOrder: 1, status: 'APPROVED' },
        { stepOrder: 2, status: 'PENDING' },
        target,
    ]), false)
})