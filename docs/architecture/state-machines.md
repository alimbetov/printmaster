# PrintMaster — State Machines

State machines are domain contracts. Do not collapse them into one mega-enum.

## Design

DRAFT → VALIDATING → VALID → PROOF_RENDERING → PROOF_READY → APPROVED → LOCKED → ARCHIVED

Failure/side transitions:
- VALIDATING → INVALID
- PROOF_RENDERING → PROOF_FAILED
- Any editable material change after VALID/PROOF_READY creates a new revision and returns to DRAFT.

## Order

DRAFT → PENDING_PAYMENT → PAID → PRODUCTION_READY → IN_PRODUCTION → QC_COMPLETE → PACKED → SHIPPED → DELIVERED → CLOSED

Terminal/alternate:
- CANCELLED
- REFUNDED
- DISPUTED

## Payment

INITIATED → AUTHORIZED → CAPTURED

Alternate:
- FAILED
- CANCELLED
- REFUNDED
- PARTIALLY_REFUNDED
- CHARGEBACK

All provider callbacks are idempotent.

## RenderJob

QUEUED → RUNNING → SUCCEEDED

Alternate:
- FAILED_RETRYABLE
- FAILED_FINAL
- SUPERSEDED

## GangSheet

DRAFT → NESTED → VALIDATED → LOCKED → SENT_TO_CONTRACTOR → PRINTED → RECEIVED → ARCHIVED

Alternate:
- VOID

A revision is immutable from LOCKED onward.

## ProductionItem

RESERVED → GARMENT_VERIFIED → TRANSFER_VERIFIED → PRESS_READY → PRESSED → QC_PENDING → QC_PASSED → PACKED

Alternate:
- QC_FAILED → REWORK
- QC_FAILED → SCRAP
- PRESS_FAILED
- CANCELLED before irreversible production

## QualityCheck

PENDING → PASS

Alternate:
- WARN_ACCEPTED
- FAIL → REWORK → PENDING
- FAIL → SCRAP

## Shipment

CREATED → LABEL_READY → HANDED_OVER → IN_TRANSIT → DELIVERED

Alternate:
- DELIVERY_FAILED
- RETURN_TO_SENDER
- RETURNED

## Return/Claim

REQUESTED → TRIAGED → EVIDENCE_COLLECTED → DECIDED

Resolution:
- REFUND
- REPRINT
- REJECTED
- PARTIAL_REFUND

## Transition implementation rules

- Validate source state in application service/domain method.
- Persist transition and AuditEvent in one consistency boundary.
- External side effects occur after persistence through outbox/event processing.
- Every transition records actor, timestamp, reason and correlation id.
