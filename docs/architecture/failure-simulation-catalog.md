# PrintMaster — Failure Simulation Catalog

The mock-first project must actively simulate failure, not just the happy path.

## Geometry/render

1. Frontend and backend use different origins → golden test must fail.
2. Y-axis inverted → proof mismatch detected.
3. Rotation anchor differs → visual diff detected.
4. Size changed after proof → prior proof invalidated.
5. SKU changed after approval → new revision/proof required.
6. Rotated element crosses forbidden zone → BLOCKER.
7. Hidden tiny element expands output bounds → warning/block according to policy.
8. Browser zoom changes → stored mm geometry remains unchanged.
9. Crop reopened on another device → crop remains identical.
10. Renderer version changes → old approved order still uses pinned version.

## Asset

11. Low-resolution image enlarged → effective-DPI BLOCKER.
12. EXIF-rotated image → normalized orientation matches proof.
13. CMYK/ICC source → normalization is deterministic.
14. Animated asset upload → rejected/flattened by policy.
15. Malformed image → safe failure, no server crash.
16. SVG external URL → rejected; no network call.
17. SVG complexity bomb → timeout/resource guard.

## Concurrency

18. Same design opened in two tabs → stale save receives conflict.
19. Autosave races with undo → revision history preserves recovery.
20. Old cached proof opened → content-addressed current proof is shown.
21. Old render job finishes late → marked SUPERSEDED.

## Payment/order

22. Payment callback delivered twice → exactly one state effect.
23. Payment succeeds while asset commit fails → order does not become production-ready.
24. User double-clicks Pay → one logical payment/order result.
25. Stock vanishes after cart but before payment → reservation policy handles deterministically.
26. Cancel after production irreversible point → blocked/routed to claim policy.
27. Multi-item order partially fails → unaffected items keep independent state.

## Gang sheet/contractor

28. Same artifact accidentally added twice → manifest quantity validation.
29. Artifact omitted → reconciliation failure.
30. Gang sheet v2 created after v1 sent → v1 remains authoritative unless explicit void/reissue.
31. Contractor reports v1 while current intended revision is v2 → mismatch blocks receiving.
32. Contractor rescales sample → acceptance check fails.
33. Contractor substitutes material → batch marked non-compliant.

## Production

34. Wrong garment SKU scanned → block.
35. Wrong transfer scanned → block.
36. FRONT transfer scanned for BACK step → block.
37. Press calibration overdue → warning/block by production policy.
38. QC fails adhesion/placement → shipment blocked.
39. Rework succeeds → QC reruns, original failure preserved in audit.
40. Batch defect discovered later → all affected orders traceable by material/garment batch.

## Security

41. Fake payment webhook → signature/idempotency validation rejects.
42. Oversized upload flood → rate/quota enforcement.
43. Attempt to fetch another user’s design → authorization denies.
44. Malicious filename/script text → stored/rendered safely.
45. Public-storage access attempt → denied.

## Claims

46. Customer says placement differs → reconstruct proof, profile, artifact, gang sheet, scan, press and QC lineage.
47. Customer approved warning → approval evidence includes warning code.
48. Production artifact checksum differs from manifest → block/reject batch.
