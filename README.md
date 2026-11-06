# Finora — AI-Powered Financial Workflow Automation

Finora is an AI-powered financial workflow platform designed to simplify invoicing, payment processing, and financial management for freelancers and small businesses.

Built for the **PayPal AI Hackathon**, Finora combines intelligent AI agents with PayPal payment integration to automate financial workflows, reduce manual work, and provide actionable financial insights.

## ✨ Key Features

### 1. AI-Powered Invoice Generation
- Generate invoices using natural language prompts.
- Automatically extract client details, items, quantities, and prices.
- Calculate subtotals, taxes, and final amounts.
- Review and approve invoices before saving.

### 2. Intelligent Client Management
- Add, edit, and manage client profiles.
- Maintain client contact information.
- Track client-wise invoice and payment history.
- Search and filter clients.

### 3. PayPal Payment Integration
- Generate PayPal Sandbox payment orders.
- Allow customers to approve payments through PayPal checkout.
- Verify payment captures securely on the backend.
- Automatically update invoice payment statuses.
- Maintain payment transaction records.

### 4. AI Finance Assistant
- Ask questions about invoices, revenue, and outstanding payments.
- Get contextual financial summaries.
- Retrieve invoice-related information.
- Receive AI-generated explanations and recommendations.

### 5. Financial Insights & Analytics
- Track total revenue and outstanding payments.
- Analyze monthly financial performance.
- View payment status distributions.
- Identify top clients.
- Export financial reports as CSV.

### 6. Automated Payment Reminders
- Identify pending and overdue invoices.
- Generate personalized payment reminder messages.
- Allow users to review and approve reminders before sending.

### 7. Centralized Dashboard
- View important financial metrics.
- Monitor invoices and payment activity.
- Access clients, insights, and AI tools from one interface.

## 🤖 AI Agent Architecture

Finora uses specialized AI workflows to handle different financial tasks.

| Agent | Responsibility |
|---|---|
| Invoice Agent | Generates structured invoices from natural language |
| Finance Insights Agent | Analyzes financial records and generates insights |
| Reminder Agent | Identifies overdue invoices and drafts reminders |
| AI Assistant | Answers user queries about financial data |

Payment creation, capture verification, and financial calculations are handled by backend business logic to maintain reliability and security.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| React | Frontend development |
| Vite | Frontend build tool |
| Tailwind CSS | UI styling |
| React Router | Application navigation |
| Lucide React | Icons |
| Node.js | Backend runtime |
| Express.js | REST API development |
| MongoDB Atlas | Database |
| Mongoose | Database modeling |
| Groq API | AI-powered workflows |
| PayPal REST API | Payment processing |
| PayPal Sandbox | Payment testing |
| JWT | Authentication |
| bcrypt | Password hashing |

## 🗂️ Project Structure

```text
Finora/
│
├── client/
│   ├── public/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── lib/
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css
│
├── server/
│   ├── config/
│   ├── models/
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   ├── services/
│   ├── agents/
│   └── server.js
│
├── .gitignore
└── README.md
```

## 🔐 Security & Reliability

- Secure password hashing.
- Protected API endpoints.
- Environment variables for sensitive credentials.
- Server-side input validation.
- User-specific data access.
- Server-side PayPal payment verification.
- Payment status updates only after verified captures.

## 🎨 Design Philosophy

Finora follows a clean, modern fintech SaaS design focused on simplicity, usability, and clarity.

**Color Palette**

| Color | Hex |
|---|---|
| Cool Mist | `#F3F5F8` |
| Deep Ink | `#101A2B` |
| Quiet Navy | `#24407A` |
| Soft Tint | `#DFE6F3` |
| Gain Green | `#2E7D5B` |

## 👩‍💻 Author

**Ankita Sharma**

GitHub: [@ankita-codestack](https://github.com/ankita-codestack)

---

**Finora — Making Financial Workflows Smarter with AI.**

Built with ❤️ for the PayPal AI Hackathon.
