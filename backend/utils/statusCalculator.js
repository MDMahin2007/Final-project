export const calculateRequestStatus = (approvals) => {
    if (approvals.some((approval) => approval.status === 'REJECTED')) return 'REJECTED'
    if (approvals.length && approvals.every((approval) => approval.status === 'APPROVED')) return 'CLEARED'
    if (approvals.some((approval) => approval.status === 'APPROVED')) return 'IN_PROGRESS'
    return 'PENDING'
}

export const isApprovalReady = (target, approvals) =>
    approvals
        .filter((approval) => approval.stepOrder < target.stepOrder)
        .every((approval) => approval.status === 'APPROVED')