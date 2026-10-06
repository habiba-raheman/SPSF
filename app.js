// ================= BASIC HELPERS =================
function $(id) { return document.getElementById(id); }
function esc(t) { const d = document.createElement("div"); d.textContent = t; return d.innerHTML; }
function toggleMenu() { $("nav").classList.toggle("open"); }
function toast(msg, ok) {
  const t = $("toast");
  t.textContent = msg; t.style.background = ok === false ? "#DC2626" : "#16A34A"; t.style.display = "block";
  setTimeout(function () { t.style.display = "none"; }, 2500);
}
function currentStudent() { return students.find(function (s) { return s.id === currentStudentId; }); }
function mySkills() { const s = currentStudent(); return s ? s.skills : []; }
function nextId(list) { return list.length ? Math.max.apply(null, list.map(function (x) { return x.id; })) + 1 : 1; }

// Show one page, hide the others
function show(name) {
  document.querySelectorAll(".page").forEach(function (p) { p.classList.add("hidden"); });
  $("page-" + name).classList.remove("hidden");
  $("nav").classList.remove("open");
  window.scrollTo(0, 0);
  if (name === "dashboard") renderDashboard();
  if (name === "projects") renderProjects();
  if (name === "teammates") renderTeammates();
  if (name === "profile") fillProfileForm();
}

// Clickable chips. 'selected' is an array that is changed when chips are clicked.
function makeChips(boxId, options, selected, onChange) {
  const box = $(boxId); box.innerHTML = "";
  options.forEach(function (opt) {
    const c = document.createElement("span");
    c.className = "chip" + (selected.includes(opt) ? " selected" : "");
    c.textContent = opt;
    c.onclick = function () {
      const i = selected.indexOf(opt);
      if (i >= 0) selected.splice(i, 1); else selected.push(opt);
      c.classList.toggle("selected");
      if (onChange) onChange();
    };
    box.appendChild(c);
  });
}
function fillSelect(id, first, list) {
  $(id).innerHTML = "<option value=''>" + first + "</option>" + list.map(function (x) { return "<option>" + x + "</option>"; }).join("");
}
function tags(list) { return list.map(function (s) { return "<span class='tag'>" + esc(s) + "</span>"; }).join(""); }

// Match box used on cards and detail pages
function matchBox(r) {
  const l = matchLabel(r.percentage);
  let html = "<div class='score " + l.css + "'>" + r.percentage + "% <small>" + l.text + "</small></div>";
  html += "<div class='bar'><div style='width:" + r.percentage + "%'></div></div>";
  r.matchedSkills.forEach(function (s) { html += "<span class='ok'>&#10003; " + esc(s) + "</span>"; });
  r.missingSkills.forEach(function (s) { html += "<span class='miss'>&#9675; " + esc(s) + " (to learn)</span>"; });
  return html;
}

// ================= PROFILE =================
let profSkills = [], profInterests = [];
function fillProfileForm() {
  const s = currentStudent();
  profSkills = s ? s.skills.slice() : []; profInterests = s ? s.interests.slice() : [];
  $("pr-name").value = s ? s.name : ""; $("pr-college").value = s ? s.college : "";
  $("pr-year").value = s ? s.year : "2nd Year"; $("pr-email").value = s ? s.email : "";
  $("pr-bio").value = s ? s.bio : ""; $("pr-prev").value = s ? s.previousProjects.join(", ") : "";
  makeChips("pr-skills", SKILLS, profSkills); makeChips("pr-interests", DOMAINS, profInterests);
}
function saveProfile() {
  const name = $("pr-name").value.trim();
  if (name === "" || profSkills.length === 0) { toast("Please enter your name and select at least one skill.", false); return; }
  const data = {
    name: name, college: $("pr-college").value.trim(), year: $("pr-year").value, email: $("pr-email").value.trim(),
    bio: $("pr-bio").value.trim(), skills: profSkills.slice(), interests: profInterests.slice(),
    previousProjects: $("pr-prev").value.split(",").map(function (x) { return x.trim(); }).filter(function (x) { return x; })
  };
  const s = currentStudent();
  if (s) Object.assign(s, data);
  else { data.id = nextId(students); students.push(data); currentStudentId = data.id; save("currentStudentId", currentStudentId); }
  save("studentProfiles", students);
  toast("Profile saved successfully.");
  show("dashboard");
}

// ================= DASHBOARD =================
function renderDashboard() {
  const s = currentStudent(); const box = $("dashboard-content");
  if (!s) { box.innerHTML = "<div class='card'><h2>Welcome!</h2><p>Create your profile first to see recommendations.</p><button class='btn' onclick=\"show('profile')\">Create Profile</button></div>"; return; }
  const ranked = rankedProjects().slice(0, 3);
  const goodCount = projects.filter(function (p) { return calculateSkillMatch(s.skills, p.requiredSkills).percentage >= 40; }).length;
  const mates = students.filter(function (x) { return x.id !== s.id && x.skills.some(function (k) { return s.skills.includes(k); }); }).length;
  let html = "<h2>Hello, " + esc(s.name) + "</h2><div class='stats'>" +
    "<div class='card stat'><b>" + s.skills.length + "</b>Skills</div>" +
    "<div class='card stat'><b>" + goodCount + "</b>Projects Matched</div>" +
    "<div class='card stat'><b>" + mates + "</b>Potential Teammates</div></div>" +
    "<div class='card'><h3>Your Top Skills</h3>" + tags(s.skills) + "</div><h3 style='margin-top:16px'>Recommended Projects</h3><div class='grid'>";
  ranked.forEach(function (x) { html += projectCard(x.project, x.result); });
  box.innerHTML = html + "</div>";
}

// ================= PROJECTS =================
// Calculate match for every project and sort: higher % first,
// then interest/domain match, then more open positions (tie-breakers)
function rankedProjects() {
  const my = currentStudent(); const interests = my ? my.interests : [];
  const list = projects.map(function (p) { return { project: p, result: calculateSkillMatch(mySkills(), p.requiredSkills) }; });
  list.sort(function (a, b) {
    if (b.result.percentage !== a.result.percentage) return b.result.percentage - a.result.percentage;
    const ia = interests.includes(a.project.domain) ? 1 : 0, ib = interests.includes(b.project.domain) ? 1 : 0;
    if (ib !== ia) return ib - ia;
    return b.project.openPositions - a.project.openPositions;
  });
  return list;
}
function projectCard(p, r) {
  return "<div class='card'><h3>" + esc(p.title) + "</h3><p>" + esc(p.description) + "</p>" +
    "<p><span class='tag'>" + esc(p.domain) + "</span><span class='tag'>" + p.difficulty + "</span><span class='tag'>" + p.projectType + "</span></p>" +
    "<p>Skills: " + tags(p.requiredSkills) + "</p><p>Members: " + p.currentMembers + "/" + p.teamSize + " | Open positions: " + p.openPositions + "</p>" +
    matchBox(r) +
    "<button class='btn light' onclick='viewProject(" + p.id + ")'>View Details</button>" +
    "<button class='btn' onclick='requestJoin(" + p.id + ")'>Request to Join</button></div>";
}
function renderProjects() {
  const q = $("p-search").value.toLowerCase(), d = $("p-domain").value, df = $("p-diff").value, sk = $("p-skill").value, ty = $("p-type").value;
  let html = "";
  rankedProjects().forEach(function (x) {
    const p = x.project;
    const text = (p.title + " " + p.domain + " " + p.difficulty + " " + p.requiredSkills.join(" ")).toLowerCase();
    if (q && !text.includes(q)) return;
    if (d && p.domain !== d) return;
    if (df && p.difficulty !== df) return;
    if (sk && !p.requiredSkills.includes(sk)) return;
    if (ty && p.projectType !== ty) return;
    html += projectCard(p, x.result);
  });
  $("project-list").innerHTML = html || "<p>No projects found.</p>";
}
function viewProject(id) {
  const p = projects.find(function (x) { return x.id === id; });
  const r = calculateSkillMatch(mySkills(), p.requiredSkills);
  const owner = students.find(function (s) { return s.id === p.ownerId; });
  let html = "<button class='btn light' onclick=\"show('projects')\">&larr; Back</button><div class='card'><h2>" + esc(p.title) + "</h2><p>" + esc(p.description) + "</p>" +
    "<p><span class='tag'>" + esc(p.domain) + "</span><span class='tag'>" + p.difficulty + "</span><span class='tag'>" + p.projectType + "</span></p>" +
    "<p>Required: " + tags(p.requiredSkills) + "</p><p>Posted by: " + (owner ? esc(owner.name) : "Unknown") + "</p>" +
    "<p>Current members: " + p.currentMembers + " | Team size: " + p.teamSize + " | Open positions: " + p.openPositions + "</p>" +
    "<h3>Skill Gap Analysis</h3>" + matchBox(r) + "<p><b>Skill Match: " + r.matchedSkills.length + " / " + r.total + " = " + r.percentage + "%</b></p>" +
    "<button class='btn' onclick='requestJoin(" + p.id + ")'>Request to Join</button></div>";
  // Owner can see incoming requests
  if (p.ownerId === currentStudentId) {
    const reqs = joinRequests.filter(function (j) { return j.projectId === id; });
    html += "<div class='card'><h3>Incoming Join Requests</h3>" + (reqs.length ? reqs.map(function (j) { return "<p>&#128100; " + esc(j.studentName) + " (" + j.date + ")</p>"; }).join("") : "<p>No requests yet.</p>") + "</div>";
  }
  $("project-details").innerHTML = html; show("project-details");
}
function requestJoin(id) {
  const s = currentStudent();
  if (!s) { toast("Create your profile first.", false); show("profile"); return; }
  if (joinRequests.some(function (j) { return j.projectId === id && j.studentId === s.id; })) { toast("You already sent a request.", false); return; }
  joinRequests.push({ projectId: id, studentId: s.id, studentName: s.name, date: new Date().toLocaleDateString() });
  save("joinRequests", joinRequests);
  toast("Join request sent successfully.");
}

// ================= POST PROJECT =================
let postSkills = [];
function saveProject() {
  const s = currentStudent();
  if (!s) { toast("Create your profile first.", false); show("profile"); return; }
  const title = $("pp-title").value.trim(), size = parseInt($("pp-size").value), members = parseInt($("pp-members").value);
  if (title === "" || postSkills.length === 0) { toast("Enter a title and select required skills.", false); return; }
  if (members > size) { toast("Current members cannot be more than team size.", false); return; }
  projects.push({ id: nextId(projects), title: title, description: $("pp-desc").value.trim(), domain: $("pp-domain").value, difficulty: $("pp-diff").value,
    requiredSkills: postSkills.slice(), teamSize: size, currentMembers: members, openPositions: size - members, projectType: $("pp-type").value, ownerId: s.id });
  save("projects", projects);
  postSkills.length = 0; $("pp-title").value = ""; $("pp-desc").value = ""; makeChips("pp-skills", SKILLS, postSkills);
  toast("Project posted successfully."); show("projects");
}

// ================= TEAMMATES =================
let teamSkills = [];
function renderTeammates() {
  const q = $("t-search").value.toLowerCase(), d = $("t-domain").value, y = $("t-year").value;
  const list = students.filter(function (s) { return s.id !== currentStudentId; }).map(function (s) {
    return { student: s, result: calculateSkillMatch(s.skills, teamSkills) };
  });
  list.sort(function (a, b) { return b.result.percentage - a.result.percentage; });
  let html = "";
  list.forEach(function (x) {
    const s = x.student;
    if (y && s.year !== y) return;
    if (d && !s.interests.includes(d)) return;
    if (q && !(s.name + " " + s.bio + " " + s.skills.join(" ") + " " + s.interests.join(" ") + " " + s.year).toLowerCase().includes(q)) return;
    html += "<div class='card'><h3>" + esc(s.name) + "</h3><p>" + esc(s.college) + " | " + s.year + "</p><p>Skills: " + tags(s.skills) + "</p><p>Interests: " + tags(s.interests) + "</p><p>" + esc(s.bio) + "</p>" +
      (teamSkills.length ? matchBox(x.result) : "<p><i>Select required skills to see match %</i></p>") +
      "<button class='btn light' onclick='viewStudent(" + s.id + ")'>View Profile</button><button class='btn' onclick='connect(" + s.id + ")'>Connect</button></div>";
  });
  $("student-list").innerHTML = html || "<p>No students found.</p>";
}
function connect(id) {
  const s = students.find(function (x) { return x.id === id; });
  toast("Connection request sent to " + s.name + ".");
}
function viewStudent(id) {
  const s = students.find(function (x) { return x.id === id; });
  let options = projects.map(function (p) { return "<option value='" + p.id + "'>" + esc(p.title) + "</option>"; }).join("");
  $("student-details").innerHTML = "<button class='btn light' onclick=\"show('teammates')\">&larr; Back</button><div class='card'><h2>" + esc(s.name) + "</h2>" +
    "<p>" + esc(s.college) + " | " + s.year + " | " + esc(s.email) + "</p><p>" + esc(s.bio) + "</p><p>Skills: " + tags(s.skills) + "</p><p>Interests: " + tags(s.interests) + "</p>" +
    "<p>Projects: " + (s.previousProjects.length ? esc(s.previousProjects.join(", ")) : "None yet") + "</p>" +
    "<h3>Match with a project</h3><select id='sd-project' onchange='showStudentMatch(" + id + ")'>" + options + "</select><div id='sd-match'></div></div>";
  show("student-details"); showStudentMatch(id);
}
function showStudentMatch(id) {
  const s = students.find(function (x) { return x.id === id; });
  const p = projects.find(function (x) { return x.id === parseInt($("sd-project").value); });
  $("sd-match").innerHTML = matchBox(calculateSkillMatch(s.skills, p.requiredSkills));
}

// ================= START =================
fillSelect("p-domain", "All Domains", DOMAINS); fillSelect("p-skill", "All Skills", SKILLS); fillSelect("t-domain", "Any Domain", DOMAINS);
$("pp-domain").innerHTML = DOMAINS.map(function (x) { return "<option>" + x + "</option>"; }).join("");
makeChips("t-skills", SKILLS, teamSkills, renderTeammates);
makeChips("pp-skills", SKILLS, postSkills);
show("home");
