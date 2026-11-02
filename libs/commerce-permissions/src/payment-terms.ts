// Payment terms permission codes — MUST match the cloud catalog's authored codes exactly.
export const ORG_PAYMENT_TERMS = {
  featureCode: 'payment-terms',
  view: 'org.payment-terms.view',
  add: 'org.payment-terms.add',
  edit: 'org.payment-terms.edit',
  delete: 'org.payment-terms.delete',
  // Publishing makes a term pickable for suppliers and unpublishing takes it back — one grant covers both
  publish: 'org.payment-terms.publish',
  // When the due days start counting; changing it moves every due date, so it is its own grant on top of edit
  baseline: {
    edit: 'org.payment-terms.baseline.edit',
  },
  // A term's instalment rules, and the schedule preview built from them
  rules: {
    view: 'org.payment-terms.rules.view',
    add: 'org.payment-terms.rules.add',
    edit: 'org.payment-terms.rules.edit',
    delete: 'org.payment-terms.rules.delete',
  },
} as const;
