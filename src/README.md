# Mergington High School Activities API

A FastAPI application that allows students to view and teachers to manage extracurricular activities sign-ups.

## Features

- View all available extracurricular activities
- Teacher authentication system
- Secure activity registration management
- Protected student registration system

## Getting Started

1. Install the dependencies:

   ```
   pip install fastapi uvicorn
   ```

2. Run the application:

   ```
   python app.py
   ```

3. Open your browser and go to:
   - API documentation: http://localhost:8000/docs
   - Alternative documentation: http://localhost:8000/redoc

## Authentication System

### Overview
The system implements a teacher-only authentication system to protect student registrations. Only authenticated teachers can register or unregister students from activities.

### Teacher Credentials
Credentials are stored in `teachers.json` in the following format:
```json
{
    "teachers": [
        {
            "username": "mrs.smith",
            "password": "teacherpass123"
        }
    ]
}
```

### Username Format
The system supports flexible username formats:
- Full name with prefix: `mrs.smith` or `mr.jones`
- Short name without prefix: `smith` or `jones`
- Case-insensitive matching

### Security Features
1. Password Security
   - Secure string comparison using `secrets.compare_digest`
   - No plaintext password logging
   - Failed attempts logged for monitoring

2. Access Control
   - All registration endpoints protected
   - Clear error messages for unauthorized access
   - Session maintained in frontend

## API Endpoints

| Method | Endpoint                                                          | Description                                                         | Auth Required |
| ------ | ----------------------------------------------------------------- | ------------------------------------------------------------------- | ------------- |
| GET    | `/activities`                                                     | Get all activities with their details and current participant count | No |
| POST   | `/auth/verify`                                                   | Verify teacher credentials | Yes |
| POST   | `/activities/{activity_name}/signup?email=student@mergington.edu` | Sign up for an activity (teachers only) | Yes |
| DELETE | `/activities/{activity_name}/unregister?email=student@mergington.edu` | Remove student from an activity (teachers only) | Yes |

## Data Model

The application uses a simple data model with meaningful identifiers:

1. **Activities** - Uses activity name as identifier:

   - Description
   - Schedule
   - Maximum number of participants allowed
   - List of student emails who are signed up

2. **Students** - Uses email as identifier:
   - Name
   - Grade level

All data is stored in memory, which means data will be reset when the server restarts.

## Error Handling

The API provides clear error responses in consistent JSON format:

```json
{
    "detail": "Error message here"
}
```

Common error scenarios:
1. Authentication Errors (401)
   - Invalid credentials
   - Missing authentication
   - Session expired

2. Registration Errors (400)
   - Activity full
   - Student already registered
   - Invalid email format

3. Resource Errors (404)
   - Activity not found
   - Student not found in activity

## Frontend Integration

The frontend provides a user-friendly interface for teachers to:
1. Log in securely using a modal dialog
2. View all activities and current registrations
3. Register/unregister students with proper authentication
4. See clear feedback messages for all operations

### Login Flow
1. Click "Login" button to open modal
2. Enter teacher credentials
3. On success:
   - Modal closes
   - UI updates to show authenticated state
   - Registration buttons become active
4. On failure:
   - Error message shows in modal
   - Credentials can be re-entered

### Authentication State
- Maintained using session storage
- Automatically cleared on browser close
- Can be manually cleared by logging out