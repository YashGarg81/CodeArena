# CodeArena Permanent Security Regression Suite (Final Pass)

## Summary
All 18 security regression tests have been permanently integrated and verified against the actual backend and worker runtimes:

1. `SAML-XMLDSIG-PASS`: Valid signed SAML assertion accepted.
2. `SAML-TAMPER-REJECT`: Tampered assertion body rejected.
3. `SAML-XSW-REJECT`: Duplicate Assertion IDs (XML Signature Wrapping) rejected.
4. `SAML-XXE-REJECT`: DOCTYPE and external entity declarations rejected.
5. `OAUTH-STATE-SINGLEUSE`: Single-use cryptographic state verified and second verification rejected.
6. `OAUTH-STATE-TAMPER`: Forged and invalid state parameters rejected.
7. `TOTP-VERIFY-PASS`: 6-digit TOTP code verified against base32 secret.
8. `TOTP-TAMPER-REJECT`: Invalid TOTP token rejected.
9. `WS-OWNER-ALLOW`: Project owner allowed to join canvas room.
10. `WS-COLLAB-ALLOW`: Authorized collaborator allowed to join canvas room.
11. `WS-ATTACKER-REJECT`: Non-member blocked from joining private canvas room.
12. `WS-UNOWNED-REJECT`: Unowned rooms fail closed.
13. `XSS-ONERROR-DISARM`: `<img src=x onerror=alert(1)>` event handler stripped.
14. `XSS-SCRIPT-STRIP`: `<script>` blocks and payloads stripped.
15. `XSS-JAVASCRIPT-DISARM`: `javascript:` URI schemes replaced with safe `#`.
16. `XSS-IFRAME-STRIP`: `<iframe>` and `<svg>` tags stripped.
17. `SSRF-LOOPBACK-BLOCK`: `127.0.0.1` and `169.254.169.254` blocked.
18. `SSRF-RFC1918-BLOCK`: Private `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` blocked.
