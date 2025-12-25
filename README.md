# JIT Knowledge System

The **Just-in-Time (JIT) Knowledge System** is a powerful AI-driven application designed to assist Appian agents by providing instant, accurate answers from uploaded policy documents. Leveraging Google's Gemini 1.5 Pro/Flash models, the system ensures that agents have the right information at the right time, complete with citations and context-awareness.

## 🚀 Features

- **Intelligent Document Processing**: Upload policy documents (PDFs, etc.) which are analyzed by Gemini's multimodal capabilities.
- **Context-Aware Chat**: The chat interface considers specific claim contexts (e.g., Claim Type, Location) to provide tailored answers.
- **Precise Citations**: Every answer includes references to the source document and page number, ensuring trust and verification.
- **Modern UI**: Built with React, Vite, and Framer Motion for a smooth, responsive user experience.
- **Real-time Interaction**: Fast and accurate responses powered by the latest Gemini models.

## Preview
 <img width="1600" height="846" alt="image" src="https://github.com/user-attachments/assets/d180b6ad-0142-481b-b9c2-fb4da32fd86b" />
## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + Vite
- **Styling**: CSS (with modern design principles)
- **Icons**: Lucide React
- **Animations**: Framer Motion
- **HTTP Client**: Axios

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **AI Integration**: Google Generative AI SDK (@google/generative-ai)
- **File Handling**: Multer

## 📋 Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (Node Package Manager)
- **Google Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone <repository-url>
cd jit-knowledge-system
```

### 2. Backend Setup
Navigate to the backend directory and install dependencies:
```bash
cd backend
npm install
```

Create a `.env` file in the `backend` directory:
```bash
touch .env
```
Add your Google API Key to the `.env` file:
```env
GOOGLE_API_KEY=your_actual_api_key_here
PORT=3000
```

Start the backend server:
```bash
node server.js
```
The server will start on `http://localhost:3000`.

### 3. Frontend Setup
Open a new terminal, navigate to the frontend directory, and install dependencies:
```bash
cd frontend
npm install
```

Start the development server:
```bash
npm run dev
```
The application will be available at `http://localhost:5173` (or the port shown in your terminal).

## 📖 Usage Guide

1.  **Launch the App**: Open the frontend URL in your browser.
2.  **Upload Documents**: Use the "Knowledge Base" section to upload relevant policy documents (PDFs).
3.  **Set Context**: Configure the "Context Panel" with details like Claim Type (e.g., Auto, Home) and Location.
4.  **Ask Questions**: Use the chat interface to ask questions related to the uploaded policies.
    *   *Example*: "What is the coverage limit for bodily injury in CA?"
5.  **Review Answers**: The system will provide an answer with citations (e.g., `[Source: policy_v1.pdf, Page: 12]`).

## 📂 Project Structure

```
jit-knowledge-system/
├── backend/            # Express server & Gemini integration
│   ├── server.js       # Main server entry point
│   ├── uploads/        # Temp storage for uploaded files
│   └── ...
├── frontend/           # React application
│   ├── src/
│   │   ├── components/ # UI Components (Chat, ContextPanel, etc.)
│   │   ├── App.jsx     # Main application component
│   │   └── ...
│   └── ...
└── README.md           # Project documentation
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the ISC License.
