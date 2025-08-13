# 📌 AttendTrack

🚀 **AttendTrack** is a modern attendance tracking web app designed for students, teachers, and professionals to manage attendance with style, speed, and simplicity.
With an elegant UI, robust authentication, and powerful analytics, AttendTrack makes keeping track of attendance a breeze.
⚠️ **Note:** This project is **still in progress**.

---

## ✨ Features

### 🔐 Authentication

* Secure sign-up and login with **Supabase Auth**.
* Email confirmation before accessing the dashboard.
* Smooth and fast session handling with **Redux**.

### 🎨 Modern UI

* Stylish dashboard with **countdown timers**, **graphs**, and **today’s subject overview**.
* Quick attendance marking buttons for fast updates.
* Clean and responsive design powered by **Tailwind CSS**.

### 📂 Subject Management

* Add, edit, and delete subjects.
* Assign schedules to each subject.
* Bulk attendance marking via the **calendar**.
* Customizable settings: **minimum percentage limit**, **theme toggle**, and **reset options**.

### 📊 Analytics & Insights

* Attendance data represented in **graphs, tables, and numerical summaries**.
* Percentage-based performance indicators.
* Easy-to-understand visual trends.

### 🧭 Navigation

* Sidebar for easy access to:

  * Dashboard
  * Analytics
  * Today’s Classes
  * Add Subjects
  * Schedule
  * Calendar
  * Settings

---

## 🛠 Tech Stack

| Technology           | Purpose                             |
| -------------------- | ----------------------------------- |
| **React (JS)**       | Frontend framework                  |
| **Tailwind CSS**     | UI styling                          |
| **Supabase**         | Backend (Database + Authentication) |
| **Redux**            | State management                    |
| **React Router DOM** | Navigation & routing                |

---

## 📚 Motivation & Learning

I built AttendTrack entirely **from scratch without following any tutorials**.
The main goal was to **practice large-scale project structuring** while learning how to:

* Manage **authentication**.
* Store and fetch data in **Supabase**.
* Build a **responsive UI** with Tailwind CSS.
* Maintain global state with **Redux**.
* Integrate analytics and charts into a real-world app.

I’m not a professional UI designer, so I used **AI assistance for the visual design** while personally focusing on the **logic and architecture**.
Every failure during development was a **lesson in debugging, optimization, and problem-solving**.

---

## 🚀 Installation & Setup

### 1️⃣ Clone the repository

```bash
git clone https://github.com/your-username/attendtrack.git
cd attendtrack
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Set up environment variables

Create a `.env` file in the root directory and add your Supabase credentials:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_KEY=your-supabase-key
```

### 4️⃣ Start the development server

```bash
npm run dev
```

---

## 📌 Target to Achieve

* [ ] Complete analytics backend integration.
* [ ] Improve dark/light theme support.
* [ ] Mobile-optimized design.
* [ ] Notifications for attendance percentage drops.
* [ ] Export attendance data as CSV/Excel.
* [ ] Add multiple user roles (teacher/student).

---

## 🤝 Contributing

Contributions are welcome!
If you find a bug or have suggestions for new features, feel free to **open an issue** or **submit a pull request**.

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).

---

### 💡 Note

This project is **still in progress** — you might encounter incomplete features or minor bugs.
I’m learning, improving, and constantly updating this project.
