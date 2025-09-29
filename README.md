# SSD-YantraBhashi

This repository contains the SSD-YantraBhashi web application: a full-stack project with a Node/Express backend and a React frontend. The app includes a custom programming language (YantraBhashi) editor, validation, instructor dashboard, and AI-powered code correction endpoints.

Contents
- backend/: Node.js/Express API server (AI correction service, authentication, submission handling)
- frontend/: React single-page application (Monaco editor, instructor dashboard, AI suggestion UI)

Github: https://github.com/Akshat-A-K/SSD-YantraBhashi

## Instructions to Run locally

* MongoDB should be running in local at the URI specified in backend/.env

Clone the project

```bash
  git clone https://github.com/Akshat-A-K/SSD-YantraBhashi.git
```

Go to the project directory

```bash
  cd SSD-YantraBhashi/
```

Install dependencies and Run Server

```bash
  npm install
  npm start
```

Install dependencies and Run Frontend

```bash
  npm install
  npm start
```

### Solution Diagram

![solutiondiagram](https://github.com/user-attachments/assets/dfb47c44-733f-4784-93b4-ddfd8a8d273e)

### Database Designs

![db](https://github.com/user-attachments/assets/353ea63b-36ea-496b-90ad-21ee2b22f286)

- Database consists of two collections: 
	- users: The users collection stores user details.
	- code_submissions: code_submissions collection tracks submissions and instructor reviews


### API Designs

- User

	- POST /user/signin: Authenticates a user and returns a token.
	- POST /user/signup: Registers a new user with provided credentials.
	- POST /user/logout: Logs out an authenticated user, invalidating their session.
	- GET /user/:id: Retrieves information for a specific user by ID.

- Submission

	- POST /submission/: Validates input code in Yantrabhashi language.
	- GET /submission/: Retrieves all user-submitted codes.
	- PUT /submission/:submissionId/verify: Allows instructor to verify a specific submission.

- Instructor

	- GET /instructor/students: Retrieves all students with their submission counts.
	- GET /instructor/students/:studentId/submissions: Fetches all submissions for a specific student, including code, validity, errors, and instructor feedback.
	- GET /instructor/submissions: Retrieves all submissions with user details, code, validity, errors, and instructor feedback.

- AI

	- GET /health: Checks AI route status, returns healthy if operational.
	- GET /test: Tests AI correction with sample code and mock error, returns result.
	- OPTIONS /correct: Handles CORS preflight for code correction endpoint.
	- POST /correct: Corrects provided code using AI, accepts code via body, query, or headers, saves fallback if AI fails.

### Notes
- The AI correction service tries configured providers in order (OpenAI, Google Gemini) and falls back to a rule-based correction if providers are unavailable or return invalid responses.
- To enable AI providers, set API keys in the backend environment variables. Ensure keys are valid and have sufficient quota.
- Sometimes, AI suggestions may return responses that are not in the expected format. In such cases, the displayed notes may not be perfect.
- CORS is configured to allow the frontend origin (set FRONTEND_ORIGIN in .env).


## Contributors

**Team Number:** 1

- Parv Shah - 2025201093
- Gaurav Patel - 2025201065
- Jewel Joseph - 2025201047
- Akshat Kotadia - 2025201005
- Eshwar Pingili - 2025204030


## Screenshots

![signup](https://github.com/user-attachments/assets/1fb31a7f-c11c-40e5-abba-e70de407ed4d)

![login](https://github.com/user-attachments/assets/a565ea07-1713-424a-aa35-3ea5ac1128ff)

![student](https://github.com/user-attachments/assets/774d16c1-64bb-4cfe-bb7d-6c587df87244)

![validated](https://github.com/user-attachments/assets/ef2c18d1-c210-4024-8a4d-9b973f4d38bf)

![ai](https://github.com/user-attachments/assets/299b3a1f-eda8-4128-92ae-6b0d420adb95)

![ai validated](https://github.com/user-attachments/assets/e4ceddcb-3c9b-414e-a5d9-f61f464b4bfc)

![instructor](https://github.com/user-attachments/assets/93eb55c1-7898-4f2a-a7b4-0b14ceeb69d9)

![feedback](https://github.com/user-attachments/assets/1cec5d20-02e2-48b6-88e0-6afd6260a767)

