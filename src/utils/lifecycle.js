const allowedTransitions = {
  requested: ['pending_approval', 'cancelled_by_client'],
  pending_approval: ['accepted', 'cancelled_by_client'],
  accepted: ['in_progress', 'cancelled_by_worker'],
  in_progress: ['completed', 'cancelled_by_worker'],
  completed: [],
  cancelled_by_client: [],
  cancelled_by_worker: []
};

const isTransitionAllowed = (currentStatus, newStatus) => {
  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

module.exports = {
  allowedTransitions,
  isTransitionAllowed
};
