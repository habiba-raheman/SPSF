// ---------- MATCHING ALGORITHM ----------
// Match % = (required skills the student has / total required skills) x 100
function calculateSkillMatch(studentSkills, requiredSkills) {
  const matchedSkills = [];
  const missingSkills = [];
  for (let i = 0; i < requiredSkills.length; i++) {
    if (studentSkills.includes(requiredSkills[i])) matchedSkills.push(requiredSkills[i]);
    else missingSkills.push(requiredSkills[i]);
  }
  let percentage = 0;
  if (requiredSkills.length > 0) percentage = Math.round((matchedSkills.length / requiredSkills.length) * 100);
  return { percentage: percentage, matchedSkills: matchedSkills, missingSkills: missingSkills, total: requiredSkills.length };
}

// Label + css class for the percentage
function matchLabel(p) {
  if (p >= 90) return { text: "Excellent Match", css: "excellent" };
  if (p >= 70) return { text: "Good Match", css: "good" };
  if (p >= 40) return { text: "Partial Match", css: "partial" };
  return { text: "Low Match", css: "low" };
}
