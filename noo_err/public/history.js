//public/history.js
document.addEventListener("DOMContentLoaded", () => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first.");
      window.location.href = "index.html";
      return;
    }
  
    fetch("http://localhost:3000/api/stats/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId })
    })
      .then(res => res.json())
      .then(data => {
        console.log("📥 History loaded:", data);
        const tableBody = document.querySelector("#history-table tbody");
        tableBody.innerHTML = "";
  
        if (!data.length) {
          tableBody.innerHTML = "<tr><td colspan='5'>No history found.</td></tr>";
          return;
        }
  
        // Group by date
        const grouped = {};
        data.forEach(entry => {
          const date = new Date(entry.createdAt).toLocaleDateString();
          if (!grouped[date]) grouped[date] = [];
          grouped[date].push(entry);
        });
  
        Object.keys(grouped).forEach(date => {
          const dateRow = document.createElement("tr");
          dateRow.innerHTML = `<td colspan="5" style="font-weight:bold; background-color:#f0f0f0;">📅 ${date}</td>`;
          tableBody.appendChild(dateRow);
  
          grouped[date].forEach(entry => {
            const time = new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const tr = document.createElement("tr");
            tr.innerHTML = `
              <td>${time}</td>
              <td>${entry.person}</td>
              <td>₹${entry.totalPaid.toFixed(2)}</td>
              <td>₹${entry.totalSpent.toFixed(2)}</td>
              <td>₹${entry.totalReceived.toFixed(2)}</td>
            `;
            tableBody.appendChild(tr);
          });
        });
      })
      .catch(err => {
        console.error("❌ Error loading history:", err);
        alert("Failed to load history.");
      });
  });
  