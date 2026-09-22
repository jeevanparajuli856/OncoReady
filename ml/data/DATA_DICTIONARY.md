# Synthetic readiness data dictionary

Every row is a feature-time snapshot for a fictional `SYN-####` patient at
`T-7`, `T-2`, or `T-1`. No names, contact details, MRNs, dates of birth, or
real patient records are present.

| Field | Meaning | Model feature? |
|---|---|---|
| `patient_key` | Synthetic stable identifier | No (identity) |
| `checkpoint` | Feature availability checkpoint | No (time marker) |
| `transport_available` | Synthetic ride availability flag | Yes |
| `callback_requested` | Synthetic request for supportive callback | Yes |
| `unresolved_barriers` | Count of unresolved practical barriers | Yes |
| `hours_to_treatment` | Synthetic hours until treatment horizon | Yes |
| `supportive_follow_up` | Synthetic generated target label | No (future/target) |
| `patient_reply_text` | Placeholder future reply field for leakage checks | No (future text) |

The model target is not a clinical outcome. It is generated before model
fitting from a transparent seeded rule: intercept `-0.35`, transport weight
`-0.95`, callback weight `+0.72`, barrier weight `+0.34`, hours weight
`-0.006`, and bounded seeded noise. Availability reduces the synthetic blocker
association. Patient-level split keeps all three rows for a patient in one
partition; no held-out tuning is performed.

For the descriptive confusion matrix only, a fixed score threshold of 0.4 is
used. This is not a clinical decision threshold.
