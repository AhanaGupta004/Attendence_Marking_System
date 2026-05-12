# Student Attendance Management System (C++ + Web)

## Overview

This project presents a **Student Attendance Management System** implemented in two different ways:

* **C++ Console Application** – A traditional file-based attendance management system
* **Web Application** – A modern browser-based attendance dashboard using HTML, CSS, and JavaScript

Both versions are independent and demonstrate different approaches to solving student attendance management efficiently.

---

## Objectives

* Automate student attendance tracking
* Reduce manual attendance errors
* Demonstrate both console-based and web-based development
* Provide an easy-to-use attendance management system
* Store and manage student records efficiently

---

## Features

### C++ Console Version

* Admin and Student panels
* Password-protected admin login
* Add new students with auto-generated roll numbers
* Delete student records
* Display all students
* Mark attendance for 6 subjects
* Check attendance by roll number
* Check attendance by date
* File handling for permanent data storage

### Web Version

* Modern glassmorphism UI
* Admin authentication system
* Student attendance dashboard
* Add and delete students
* Attendance marking system
* Attendance statistics visualization using charts
* Backup & restore attendance data using JSON
* LocalStorage-based data persistence
* Responsive design for desktop and mobile

---

## Technologies Used

### C++ Version

* C++
* File Handling
* Object-Oriented Programming
* Console-based UI

### Web Version

* HTML5
* CSS3
* JavaScript
* Chart.js
* Browser LocalStorage

---

## How to Run

### C++ Version

Compile:

```bash
g++ test_a.cpp -o app
```

Run:

```bash
./app
```

---

### Web Version

1. Open `index.html` in any browser
2. Use the admin login:

```text
Password: admin123
```

---

## Project Structure

```text
student-attendance-system/
│
├── cpp-version/
│   └── test_a.cpp
│
├── web-version/
│   ├── index.html
│   ├── style.css
│   └── app.js
│
└── README.md
```

---

## Screens / Modules

### Admin Features

* Login Authentication
* Add Student
* Delete Student
* Mark Attendance
* View All Students
* Attendance Statistics
* Backup & Restore Data

### Student Features

* Check Total Attendance
* Check Attendance by Date
* Attendance Visualization

---

## Data Storage

### C++ Version

Uses text files:

* `students.txt`
* `rollNumber.txt`
* `attendance_subject1.txt` to `attendance_subject6.txt`

### Web Version

Uses browser LocalStorage:

* Student records
* Roll numbers
* Attendance records

---

## Limitations

* No database integration
* No backend/server support
* Basic authentication system
* C++ version is platform-dependent (`conio.h`)
* Web version stores data only in browser storage

---

## Future Scope

* Add database support (MySQL / MongoDB)
* Integrate backend using Node.js or PHP
* Cloud-based attendance storage
* Email/SMS notifications
* QR-code attendance system
* Biometric or face-recognition attendance
* Improved analytics dashboard

---

## Source Files

* `test_a.cpp` – Console-based C++ implementation 
* `index.html` – Web application structure 
* `style.css` – Styling and responsive UI 
* `app.js` – Application logic and attendance handling 

---

## Author

**Ahana Gupta**
