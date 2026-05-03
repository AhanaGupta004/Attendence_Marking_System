#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <ctime>
#include <algorithm>
#include <conio.h> 

using namespace std;

const int numSubjects = 6;
const string studentFile = "students.txt";
const string rollNumberFile = "rollNumber.txt"; 
const string attendanceBaseFile = "attendance_subject";
const string adminPassword = "admin123";

class Student {
public:
    string name;
    int rollNo;

    Student() {}

    Student(const string& n, int r) : name(n), rollNo(r) {}
};

class AttendanceSystem {
public:
   void run() {
    int userType;

    while (true) {
        cout << "\nChoose user type:\n";
        cout << "1. Admin\n";
        cout << "2. Student\n";
        cout << "3. Exit\n";
        cout << "Enter your choice: ";
        cin >> userType;

        if (userType == 1) {

    int attempts = 3;
    bool loginSuccess = false;

    while (attempts > 0) {
        if (isAdminLoggedIn()) {
            cout << "Login successful!\n";
            loginSuccess = true;
            break;
        } else {
            attempts--;
            if (attempts > 0)
                cout << "Wrong password. Attempts left: " << attempts << endl;
        }
    }

    if (!loginSuccess) {
        cout << "Access denied! Returning to main menu...\n";
        continue;
    }

            int choice;
            do {
                cout << "\nAdmin Panel\n";
                cout << "1. Mark Attendance\n";
                cout << "2. Add Student\n";
                cout << "3. Delete Student\n";
                cout << "4. Display All Students\n";
                cout << "5. Total Attendance with roll number\n";
                cout << "6. Check Attendance by Date\n";
                cout << "7. Logout\n";
                cout << "Enter your choice: ";
                cin >> choice;

                switch (choice) {
                    case 1: markAttendance(); break;
                    case 2: addStudent(); break;
                    case 3: deleteStudent(); break;
                    case 4: displayAllStudents(); break;
                    case 5: checkAttendanceByRollNo(); break;
                    case 6: checkAttendanceByDate(); break;
                    case 7: cout << "Logging out...\n"; break;
                    default: cout << "Invalid choice.\n";
                }

            } while (choice != 7);

        } else if (userType == 2) {
            checkAttendance();

        } else if (userType == 3) {
            cout << "Exiting program...\n";
            break;

        } else {
            cout << "Invalid choice. Try again.\n";
        }
    }
}

private:
    bool isAdminLoggedIn() {
    cout << "Enter admin password: ";

    char ch;
    string password = "";

    while ((ch = _getch()) != '\r') {
        if (ch == 8) { 
            if (!password.empty()) {
                password.pop_back(); 
                cout << "\b \b";  
            }
        } else {
            password += ch;
            cout << '*';
        }
    }

    cout << endl;

    return (password == adminPassword);
}


    void createAttendanceFiles() {
        for (int i = 1; i <= numSubjects; ++i) {
            ofstream attendanceFile(attendanceBaseFile + to_string(i) + ".txt", ios::app);
            if (!attendanceFile) {
                cerr << "Error creating attendance file for subject " << i << "!" << endl;
                return;
            }
            attendanceFile.close();
        }
    }

    bool isRollNoDuplicate(int rollNo) {
        ifstream studentFileInput(studentFile);

        if (!studentFileInput) {
            cerr << "Error opening student file!" << endl;
            return true; 
        }

        string line;
        while (getline(studentFileInput, line)) {
            Student student;
            istringstream iss(line);
            iss >> student.name >> student.rollNo;

            if (student.rollNo == rollNo) {
                studentFileInput.close();
                return true; 
            }
        }

        studentFileInput.close();
        return false; 
    }

    int getLastRollNumber() {
        ifstream rollNumberFileInput(rollNumberFile);
        int lastRollNumber = 0;

        if (rollNumberFileInput) {
            rollNumberFileInput >> lastRollNumber;
        }

        rollNumberFileInput.close();

        return lastRollNumber;
    }

    void updateLastRollNumber(int newRollNumber) {
        ofstream rollNumberFileOutput(rollNumberFile);
        rollNumberFileOutput << newRollNumber << endl;
        rollNumberFileOutput.close();
    }

    void addStudent() {
        ofstream studentFileOutput(studentFile, ios::app);

        if (!studentFileOutput) {
            cerr << "Error opening student file!" << endl;
            return;
        }

        Student student;
        bool validName = false;

        do {
            cout << "Enter student name (without numbers): ";
            cin.ignore(); 
            getline(cin, student.name);
            validName = all_of(student.name.begin(), student.name.end(), [](char c) {
                return !isdigit(c);
            });

            if (!validName) {
                cout << "Invalid name. Please enter a name without numbers.\n";
            }

        } while (!validName);
        int lastRollNumber = getLastRollNumber();
        student.rollNo = lastRollNumber + 1;

        studentFileOutput << student.name << " " << student.rollNo << endl;
        cout << "Student added successfully: " << student.name << " (Roll No: " << student.rollNo << ")\n";

        studentFileOutput.close();

        updateLastRollNumber(student.rollNo);
    }

    void deleteStudent() {
        ifstream studentFileInput(studentFile);
        ofstream tempFile("temp.txt");

        if (!studentFileInput || !tempFile) {
            cerr << "Error opening files!" << endl;
            return;
        }

        int studentID;
        cout << "Enter student ID to delete: ";
        cin >> studentID;

        string line;
        bool studentDeleted = false;

        while (getline(studentFileInput, line)) {
            Student student;
            istringstream iss(line);
            iss >> student.name >> student.rollNo;

            if (student.rollNo != studentID) {
                tempFile << line << endl;
            } else {
                studentDeleted = true;
            }
        }

        if (studentDeleted) {
            cout << "Student deleted successfully: " << studentID << endl;
        } else {
            cout << "Student not found: " << studentID << endl;
        }

        studentFileInput.close();
        tempFile.close();

        remove(studentFile.c_str());
        rename("temp.txt", studentFile.c_str());
    }

    void displayAllStudents() {
        ifstream studentFileInput(studentFile);

        if (!studentFileInput) {
            cerr << "Error opening student file!" << endl;
            return;
        }

        cout << "All Students:\n";

        string line;

        while (getline(studentFileInput, line)) {
            Student student;
            istringstream iss(line);
            iss >> student.name >> student.rollNo;

            cout << "Name: " << student.name << ", Roll No: " << student.rollNo << endl;
        }

        studentFileInput.close();
    }

    void markAttendance() {
        ifstream studentFileInput(studentFile);

        if (!studentFileInput) {
            cerr << "Error opening student file!" << endl;
            return;
        }

        createAttendanceFiles();

        int studentID;
        cout << "Enter student ID to mark attendance: ";
        cin >> studentID;

        string line;
        bool studentFound = false;

        while (getline(studentFileInput, line)) {
            Student student;
            istringstream iss(line);
            iss >> student.name >> student.rollNo;

            if (student.rollNo == studentID) {
                studentFound = true;
                cout << "Student found. Marking attendance for student " << student.name << " (Roll No: " << student.rollNo << ")\n";

                time_t now = time(0);
                tm* ltm = localtime(&now);
                string currentDate = to_string(1900 + ltm->tm_year) + '-' +
                                    to_string(1 + ltm->tm_mon) + '-' +
                                    to_string(ltm->tm_mday);

                for (int i = 1; i <= numSubjects; ++i) {
                    ofstream attendanceFile(attendanceBaseFile + to_string(i) + ".txt", ios::app);

                    if (!attendanceFile) {
                        cerr << "Error opening attendance file for subject " << i << "!" << endl;
                        return;
                    }

                    int attendance;
                    cout << "Enter attendance for subject " << i << " (0/1 format): ";
                    cin >> attendance;
                    if (attendance != 0 && attendance != 1) {
                        cout << "Invalid Input. Enter either 0 or 1 " << endl;
                        return;
                    }
                    attendanceFile << student.rollNo << " " << attendance << " " << currentDate << endl;
                    attendanceFile.close();
                }

                cout << "Attendance marked successfully!\n";
                break;
            }
        }

        if (!studentFound) {
            cout << "Student not found: " << studentID << endl;
        }

        studentFileInput.close();
    }

    void checkAttendance() {
        int choice;
        cout << "Choose an option:\n";
        cout << "1. Check Total Attendance by Roll Number\n";
        cout << "2. Check Attendance by Date\n";
        cout << "Enter your choice: ";
        cin >> choice;

        switch (choice) {
            case 1:
                checkAttendanceByRollNo();
                break;
            case 2:
                checkAttendanceByDate();
                break;
            default:
                cout << "Invalid choice.\n";
                break;
        }
    }

    void checkAttendanceByRollNo() {
        cout << "Enter your roll number to check attendance: ";
        int rollNo;
        cin >> rollNo;

        for (int i = 1; i <= numSubjects; ++i) {
            ifstream attendanceFile(attendanceBaseFile + to_string(i) + ".txt");

            if (!attendanceFile) {
                cerr << "Error opening attendance file for subject " << i << "!" << endl;
                return;
            }

            int totalAttendance = 0;
            string line;

            while (getline(attendanceFile, line)) {
                istringstream iss(line);
                int studentRollNo, attendance;
                string currentDate;

                iss >> studentRollNo >> attendance >> currentDate;

                if (studentRollNo == rollNo) {
                    totalAttendance += attendance;
                }
            }

            cout << "Total attendance for subject " << i << ": " << totalAttendance << endl;

            attendanceFile.close();
        }
    }

    void checkAttendanceByDate() {
        int rollNo;
        cout << "Enter your roll number to check attendance: ";
        cin >> rollNo;

        cout << "Enter the date to check attendance (YYYY-MM-DD): ";
        string inputDate;
        cin >> inputDate;

        for (int i = 1; i <= numSubjects; ++i) {
            ifstream attendanceFile(attendanceBaseFile + to_string(i) + ".txt");

            if (!attendanceFile) {
                cerr << "Error opening attendance file for subject " << i << "!" << endl;
                return;
            }

            int totalAttendance = 0;
            string line;

            while (getline(attendanceFile, line)) {
                istringstream iss(line);
                int studentRollNo, attendance;
                string currentDate;

                iss >> studentRollNo >> attendance >> currentDate;

                if (currentDate == inputDate && studentRollNo == rollNo) {
                    totalAttendance += attendance;
                }
            }

            cout << "Total attendance for subject " << i << " on " << inputDate << " for Roll No " << rollNo << ": " << totalAttendance << endl;

            attendanceFile.close();
        }
    }
};

int main() {
    AttendanceSystem attendanceSystem;
    attendanceSystem.run();

    return 0;
}
