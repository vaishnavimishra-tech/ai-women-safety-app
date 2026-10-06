# SOS Flow Documentation (Week 5 - Aastha)

## Payload
`POST /api/sos`
```json
{ "userId": "<mongo id>", "latitude": 23.2599, "longitude": 77.4126, "triggerSource": "PRESS_AND_HOLD_TRIGGER" }
```
SMS sent to every contact contains: **User name, coordinates, Google Maps link, time.**

## Step-by-step (for viva)
1. **Trigger** - SOS button (`PanicHubPage`), 3-shake (`shakeService`), or voice "HELP" (`VoiceCommandPage`). All call `armSos()` in `SecurityContext.jsx`.
2. `armSos()` starts siren + vibration and calls `triggerSOSRequest()` in `services/api.js`.
3. Backend route `/api/sos` (`server/server.js`) validates userId + coordinates and checks the user exists.
4. Contacts are fetched **dynamically** from MongoDB (`Contact.find({ userId })`).
5. **Edge case:** no contacts -> alert saved as `no_contacts`, HTTP 404 `NO_CONTACTS`, frontend shows a notice.
6. `services/smsService.js` normalises phone numbers (E.164) and sends via Twilio to all contacts in parallel (`Promise.all`; one failure never blocks the others, 10s timeout per SMS).
7. Result of each SMS (sent / failed / demo, Twilio SID, error) is saved in the `SosAlert` collection with timestamp (`models/sosAlert.js`).
8. Response returns `contactsNotified / contactsTotal`; frontend shows the result and writes an audit log.
9. History: `GET /api/sos/history/:userId`.

## Gateway errors handled
| Case | Behaviour |
|---|---|
| Invalid / short phone number | marked `failed`, others still sent |
| Twilio trial, unverified number (code 21608) | marked `failed` with hint to verify number |
| Twilio slow/unreachable | 10s timeout, marked `failed` |
| Credentials missing / `SMS_MODE=demo` | DEMO mode - SMS printed to console, not sent |
| All SMS fail | HTTP 502, alert still saved in history |

## Testing checklist
- [ ] User with no contacts -> notice shown
- [ ] User with 2+ contacts (Twilio-verified numbers) -> all receive SMS
- [ ] One invalid number -> partial result, others delivered
- [ ] Alert appears in `GET /api/sos/history/:userId` with timestamp
- [ ] Shake x3 on a real phone -> 5s countdown -> SOS
- [ ] Voice "HELP" on Voice page -> 5s countdown -> SOS
