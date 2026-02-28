document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  function showMessage(text, type = "info") {
    messageDiv.textContent = text;
    messageDiv.className = `message ${type}`;
    messageDiv.classList.remove("hidden");
    setTimeout(() => messageDiv.classList.add("hidden"), 4000);
  }

  function renderActivities(data) {
    activitiesList.innerHTML = "";
    activitySelect.innerHTML = '<option value="">-- Select an activity --</option>';

    Object.entries(data).forEach(([name, info]) => {
      // populate select
      const opt = document.createElement("option");
      opt.value = name;
      opt.textContent = name;
      activitySelect.appendChild(opt);

      // card
      const card = document.createElement("div");
      card.className = "activity-card";

      const title = document.createElement("h4");
      title.textContent = name;
      card.appendChild(title);

      const desc = document.createElement("p");
      desc.textContent = info.description;
      card.appendChild(desc);

      const schedule = document.createElement("p");
      schedule.innerHTML = `<strong>Schedule:</strong> ${info.schedule}`;
      card.appendChild(schedule);

      const max = document.createElement("p");
      max.innerHTML = `<strong>Max participants:</strong> ${info.max_participants}`;
      card.appendChild(max);

      // Participants section (new)
      const participantsWrap = document.createElement("div");
      participantsWrap.className = "participants";

      const participantsTitle = document.createElement("p");
      participantsTitle.innerHTML = `<strong>Participants (${info.participants.length}):</strong>`;
      participantsWrap.appendChild(participantsTitle);

      if (!info.participants || info.participants.length === 0) {
        const none = document.createElement("p");
        none.className = "info";
        none.textContent = "No participants yet.";
        participantsWrap.appendChild(none);
      } else {
        const list = document.createElement("div");
        list.className = "participants-list";
        info.participants.forEach((email) => {
          const item = document.createElement("div");
          item.className = "participant-item";
          const emailSpan = document.createElement("span");
          emailSpan.textContent = email;
          emailSpan.className = "participant-email";
          const delBtn = document.createElement("button");
          delBtn.className = "delete-participant";
          delBtn.title = "Remove participant";
          delBtn.innerHTML = "<svg width='18' height='18' viewBox='0 0 20 20' fill='none' xmlns='http://www.w3.org/2000/svg'><circle cx='10' cy='10' r='9' fill='#f8f8fa' stroke='#d32f2f' stroke-width='2'/><path d='M7 7L13 13M13 7L7 13' stroke='#d32f2f' stroke-width='2' stroke-linecap='round'/></svg>";
          delBtn.onclick = function() {
            if (confirm(`Remove ${email} from ${name}?`)) {
              fetch(`/activities/${encodeURIComponent(name)}/unregister?email=${encodeURIComponent(email)}`, {
                method: "POST"
              })
                .then(async (res) => {
                  if (!res.ok) {
                    const err = await res.json().catch(() => ({ detail: "Unregister failed" }));
                    throw new Error(err.detail || "Unregister failed");
                  }
                  return res.json();
                })
                .then(() => fetch("/activities"))
                .then((res) => res.json())
                .then(renderActivities)
                .catch((err) => showMessage(err.message, "error"));
            }
          };
          item.appendChild(emailSpan);
          item.appendChild(delBtn);
          list.appendChild(item);
        });
        participantsWrap.appendChild(list);
      }

      card.appendChild(participantsWrap);
      activitiesList.appendChild(card);
    });
  }

  fetch("/activities")
    .then((res) => res.json())
    .then(renderActivities)
    .catch((err) => {
      activitiesList.innerHTML = '<p class="error">Failed to load activities.</p>';
      console.error(err);
    });

  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const email = document.getElementById("email").value.trim();
    const activity = activitySelect.value;
    if (!activity) {
      showMessage("Please select an activity", "error");
      return;
    }
    if (!email) {
      showMessage("Please enter an email", "error");
      return;
    }

    fetch(`/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`, {
      method: "POST",
    })
      .then(async (res) => {
        if (!res.ok) {
          const err = await res.json().catch(() => ({ detail: "Signup failed" }));
          throw new Error(err.detail || "Signup failed");
        }
        return res.json();
      })
      .then((data) => {
        showMessage(data.message, "success");
        return fetch("/activities");
      })
      .then((res) => res.json())
      .then(renderActivities)
      .catch((err) => showMessage(err.message, "error"));
  });
});
