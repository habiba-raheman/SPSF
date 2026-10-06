// ---------- Lists used in forms ----------
const SKILLS = ["C","C++","HTML","CSS","JavaScript","Python","Java","SQL","Git/GitHub","UI/UX","Cybersecurity","AI/ML","Data Structures","Networking","Cryptography"];
const DOMAINS = ["Web Development","App Development","Cybersecurity","AI/ML","Data Science","IoT","Education","Healthcare","Finance","Open Source","Hackathon","Design","Networking"];

// ---------- Sample data (used only the first time) ----------
const sampleStudents = [
  { id: 1, name: "Aarav Patil", college: "Sample College", year: "2nd Year", email: "aarav@example.com", bio: "Loves C++ and web basics.", skills: ["C","C++","HTML","CSS"], interests: ["Web Development","Cybersecurity"], previousProjects: ["Calculator in C++"] },
  { id: 2, name: "Ananya Sharma", college: "Sample College", year: "2nd Year", email: "ananya@example.com", bio: "Designs clean user interfaces.", skills: ["HTML","CSS","UI/UX"], interests: ["Web Development","Design"], previousProjects: ["Portfolio website"] },
  { id: 3, name: "Rohan Kulkarni", college: "Sample College", year: "2nd Year", email: "rohan@example.com", bio: "Interested in data and Python.", skills: ["C++","Python","SQL"], interests: ["AI/ML","Data Science"], previousProjects: ["Marks analyzer"] },
  { id: 4, name: "Sneha Joshi", college: "Sample College", year: "2nd Year", email: "sneha@example.com", bio: "Networking and security enthusiast.", skills: ["C","C++","Networking"], interests: ["Cybersecurity","Networking"], previousProjects: [] },
  { id: 5, name: "Aditya More", college: "Sample College", year: "2nd Year", email: "aditya@example.com", bio: "Frontend developer in the making.", skills: ["HTML","CSS","JavaScript"], interests: ["Web Development"], previousProjects: ["To-do list app"] }
];
const sampleProjects = [
  { id: 1, title: "Student Attendance Management System", description: "Track and report student attendance.", domain: "Web Development", difficulty: "Beginner", requiredSkills: ["HTML","CSS","C++"], teamSize: 4, currentMembers: 2, openPositions: 2, projectType: "Mini Project", ownerId: 1 },
  { id: 2, title: "Secure File Encryption Tool", description: "Encrypt and decrypt files safely.", domain: "Cybersecurity", difficulty: "Intermediate", requiredSkills: ["C++","C","Cryptography"], teamSize: 3, currentMembers: 1, openPositions: 2, projectType: "Academic Project", ownerId: 4 },
  { id: 3, title: "Smart Learning Portal", description: "A portal with courses and quizzes.", domain: "Education", difficulty: "Intermediate", requiredSkills: ["HTML","CSS","JavaScript"], teamSize: 4, currentMembers: 2, openPositions: 2, projectType: "Hackathon", ownerId: 5 },
  { id: 4, title: "Student Performance Analyzer", description: "Analyze marks and show trends.", domain: "Data Science", difficulty: "Intermediate", requiredSkills: ["C++","Python","SQL"], teamSize: 4, currentMembers: 3, openPositions: 1, projectType: "Mini Project", ownerId: 3 },
  { id: 5, title: "Network Security Monitor", description: "Monitor network traffic for threats.", domain: "Cybersecurity", difficulty: "Advanced", requiredSkills: ["C++","Networking","Cybersecurity"], teamSize: 5, currentMembers: 2, openPositions: 3, projectType: "Open Source", ownerId: 4 }
];

// ---------- localStorage helpers ----------
function load(key, fallback) {
  const text = localStorage.getItem(key);
  return text ? JSON.parse(text) : fallback;
}
function save(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// Load saved data (or sample data on first visit)
let students = load("studentProfiles", sampleStudents);
let projects = load("projects", sampleProjects);
let joinRequests = load("joinRequests", []);
let currentStudentId = load("currentStudentId", null);
save("studentProfiles", students);
save("projects", projects);
