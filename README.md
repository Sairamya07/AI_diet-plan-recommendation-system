# 🥗 AI Diet Plan Recommendation System

<div align="center">

![Python](https://img.shields.io/badge/Python-3.10-blue?logo=python)
![Flask](https://img.shields.io/badge/Flask-Framework-black?logo=flask)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?logo=react)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite)
![AI Powered](https://img.shields.io/badge/AI-Powered-success)
![License](https://img.shields.io/badge/License-MIT-green)

### Personalized AI-Based Nutrition & Diet Recommendation Platform

Generate personalized diet plans using Artificial Intelligence based on a user's health profile, body measurements, lifestyle, and fitness goals.

</div>

---

# 📌 Overview

The **AI Diet Plan Recommendation System** is a Full Stack AI-powered web application that generates personalized nutrition recommendations for users.

Instead of providing generic meal plans, the system analyzes individual health information—including age, gender, height, weight, BMI, activity level, and fitness goals—to produce customized diet plans using a Large Language Model (LLM).

The project combines modern web technologies with AI to help users adopt healthier eating habits through intelligent recommendations.

---

# 🚀 Features

- 🔐 User Authentication
- 🤖 AI-Powered Diet Recommendation
- 📊 BMI Calculation
- 🍽 Personalized Meal Planning
- 💧 Daily Water Intake Recommendation
- 🏃 Exercise Suggestions
- 📈 Calorie Requirement Calculation
- ⚡ Fast AI Response
- 📱 Responsive User Interface
- 🔄 REST API Architecture

---

# 🎯 Problem Statement

Most diet plans available online follow a "one-size-fits-all" approach.

However, every individual differs in:

- Age
- Gender
- Height
- Weight
- BMI
- Activity Level
- Lifestyle
- Fitness Goal

Following an unsuitable diet can reduce effectiveness and may negatively impact health.

This project solves that problem by generating personalized AI-based diet plans tailored to each user.

---

# 💡 Solution

The application collects the user's health information and sends it to an AI model.

The AI analyzes the user's profile and generates:

- Daily Calories
- Breakfast Plan
- Lunch Plan
- Dinner Plan
- Healthy Snacks
- Water Intake
- Exercise Suggestions
- Nutrition Tips

Each recommendation is personalized according to the user's health profile.

---

# 🛠 Tech Stack

## Frontend

- React.js
- HTML5
- CSS3
- JavaScript

## Backend

- Python
- Flask
- REST API

## AI

- Large Language Model (LLM)
- AI API Integration

## Database

- SQLite

## Tools

- Git
- GitHub
- VS Code
- Postman

---

# 🏗 System Architecture

```
                User

                  │

                  ▼

        React Frontend

                  │

                  ▼

         Flask REST API

                  │

                  ▼

      Large Language Model

                  │

                  ▼

    Personalized Diet Plan

                  │

                  ▼

       React User Interface
```

---

# 🔄 Project Workflow

### Step 1

User registers or logs into the application.

↓

### Step 2

User enters:

- Age
- Gender
- Height
- Weight
- Activity Level
- Fitness Goal

↓

### Step 3

Frontend validates all inputs.

↓

### Step 4

The Flask backend receives the data.

↓

### Step 5

The backend creates an AI prompt.

↓

### Step 6

The prompt is sent to the Large Language Model.

↓

### Step 7

The AI generates a personalized diet recommendation.

↓

### Step 8

The Flask API returns the generated response.

↓

### Step 9

The React frontend displays:

- Diet Plan
- Calories
- Water Intake
- Exercise Suggestions
- Health Tips

---

# 📡 API Example

## Generate Diet Plan

### Request

```http
POST /generate-diet
```

### Request Body

```json
{
    "age":21,
    "gender":"Female",
    "height":165,
    "weight":60,
    "goal":"Lose Weight"
}
```

### Response

```json
{
   "diet_plan":"AI Generated Diet",
   "calories":"1700 kcal",
   "exercise":"30 minutes walking",
   "water":"3 Litres"
}
```

---

# 📂 Project Structure

```
AI-Diet-Plan-Recommendation-System/

│

├── frontend/

│ ├── src/

│ ├── components/

│ ├── pages/

│ └── assets/

│

├── backend/

│ ├── app.py

│ ├── routes/

│ ├── services/

│ ├── models/

│ └── requirements.txt

│

├── database/

│

├── screenshots/

│

├── README.md

│

└── LICENSE
```

---

# ⚙ Installation

### Clone Repository

```bash
git clone https://github.com/yourusername/AI-Diet-Plan-Recommendation-System.git
```

### Backend

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

python app.py
```

### Frontend

```bash
cd frontend

npm install

npm start
```

---

# 🎯 Future Enhancements

- Food Image Recognition
- Weekly Diet Planner
- PDF Diet Reports
- Nutrition Dashboard
- Grocery List Generator
- Voice Assistant
- Smartwatch Integration
- Doctor Consultation
- Multi-language Support
- Progress Analytics

---

# ⚠ Limitations

- Internet connection is required.
- Depends on AI API availability.
- Recommendations are intended for general wellness and should not replace professional medical advice.

---

# 🤝 Contributing

Contributions are welcome.

1. Fork the repository

2. Create a feature branch

3. Commit your changes

4. Push to GitHub

5. Open a Pull Request

---

# 👩‍💻 Developer

**Ramya Thangella**

Final Year B.Tech (Artificial Intelligence & Machine Learning)

Python Full Stack Developer | AI Enthusiast

📧 Email:ramyathangella434@gmail.com

🔗 LinkedIn:https://www.linkedin.com/in/ramyasritangella

💻 GitHub: https://github.com/Sairamya07

---

# ⭐ Support

If you found this project useful, don't forget to **Star ⭐ the repository** and share your feedback.
