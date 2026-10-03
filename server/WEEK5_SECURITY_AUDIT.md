# Week 5 – Security Audit & Backend Testing

## Project

AI Women Safety App

## Week 5 Objective

The objective of Week 5 was to test the backend APIs for input validation, authentication-related cases, duplicate users, password security, database error handling, emergency contacts, location services, and SOS functionality.

## Testing Environment

* Backend: Node.js + Express
* Database: MongoDB
* Password Security: Bcrypt
* API Testing: Postman
* Authentication: Email and password
* JWT: Not implemented in the current version
* SOS SMS: Demo Mode

## Testing Status

| Test                           | Result |
| ------------------------------ | ------ |
| Signup with valid data         | PASS   |
| Duplicate email                | PASS   |
| Successful login               | PASS   |
| Wrong password                 | PASS   |
| Wrong email                    | PASS   |
| Empty signup fields            | PASS   |
| Invalid email format           | PASS   |
| Empty password                 | PASS   |
| Password hashing               | PASS   |
| Add emergency contact          | PASS   |
| View emergency contacts        | PASS   |
| Invalid user ID                | PASS   |
| Save location                  | PASS   |
| Location history               | PASS   |
| Missing location data          | PASS   |
| SOS with valid data            | PASS   |
| SOS without location           | PASS   |
| SOS with invalid user          | PASS   |
| SOS without emergency contacts | PASS   |

## Security Observations

1. Passwords are hashed using bcrypt before being stored in MongoDB.
2. Duplicate email registration is prevented.
3. Empty required fields are validated.
4. Email format is validated.
5. Incorrect login credentials are rejected.
6. Database and API errors are handled using try-catch blocks.
7. Emergency contacts are associated with a specific user ID.
8. Location data is stored with the corresponding user ID.
9. SOS requests verify that the user exists and has emergency contacts.
10. Invalid MongoDB ID input is caught by the server error handler.

## Current Limitations

* JWT/bearer-token authentication is not implemented yet.
* SOS SMS is currently running in Demo Mode.
* Twilio SMS delivery is not active in the current implementation.
* Password-strength validation is not currently implemented.

## Conclusion

Week 5 backend security auditing and API testing were completed. The major backend validation, authentication, emergency contact, location, and SOS flows were tested successfully using Postman.
