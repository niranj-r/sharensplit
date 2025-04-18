let people = [];
let stops = [];

function addPerson() {
    let name = prompt("Enter name:");
    if (name) people.push(name);
    updatePeopleList();
}

function updatePeopleList() {
    let list = document.getElementById("people-list");
    list.innerHTML = "";
    people.forEach(person => {
        let li = document.createElement("li");
        li.textContent = person;
        list.appendChild(li);
    });
}

function addStop() {
    let stopName = prompt("Enter stop name:");
    let totalExpense = parseFloat(prompt("Enter total amount spent at " + stopName + ":"));
    let payments = {};
    let participants = [];

    people.forEach(person => {
        let paid = parseFloat(prompt(`How much did ${person} pay at ${stopName}? (Enter 0 if not paid)`));
        if (paid > 0) {
            payments[person] = paid;
        }
    });

    participants = people.filter(person => confirm(`${person} participated in ${stopName}?`));

    let splitType = prompt("Choose split method: 1-Equal, 2-% Based, 3-Shares, 4-Exact Amount");
    let amounts = {};
    
    if (splitType == 1) {
        let share = totalExpense / participants.length;
        participants.forEach(p => amounts[p] = share);
    } else if (splitType == 2) {
        let totalPercent = 0;
        participants.forEach(p => {
            let percent = parseFloat(prompt(`% for ${p}:`));
            totalPercent += percent;
            amounts[p] = (percent / 100) * totalExpense;
        });
        if (totalPercent !== 100) alert("Total % must be 100!");
    } else if (splitType == 3) {
        let totalShares = 0;
        let shares = {};
        participants.forEach(p => {
            shares[p] = parseInt(prompt(`Shares for ${p}:`));
            totalShares += shares[p];
        });
        participants.forEach(p => amounts[p] = (shares[p] / totalShares) * totalExpense);
    } else if (splitType == 4) {
        let totalEntered = 0;
        participants.forEach(p => {
            amounts[p] = parseFloat(prompt(`Amount for ${p}:`));
            totalEntered += amounts[p];
        });
        if (totalEntered !== totalExpense) alert("Total must match the expense!");
    }

    stops.push({ stopName, totalExpense, payments, participants, amounts });
}

function calculateSettlements() {
    let balances = {};
    people.forEach(p => balances[p] = 0);

    stops.forEach(stop => {
        for (let p in stop.payments) {
            balances[p] += stop.payments[p];
        }
        for (let p in stop.amounts) {
            balances[p] -= stop.amounts[p];
        }
    });

    let debts = [], credits = [];
    for (let p in balances) {
        if (balances[p] > 0) credits.push({ person: p, amount: balances[p] });
        else if (balances[p] < 0) debts.push({ person: p, amount: -balances[p] });
    }

    debts.sort((a, b) => b.amount - a.amount);
    credits.sort((a, b) => b.amount - a.amount);

    let settlementsTable = document.querySelector("#settlements-table tbody");
    settlementsTable.innerHTML = "";

    while (debts.length > 0 && credits.length > 0) {
        let debt = debts[0];
        let credit = credits[0];

        let settledAmount = Math.min(debt.amount, credit.amount);
        settlementsTable.innerHTML += `<tr><td>${debt.person}</td><td>${credit.person}</td><td>₹${settledAmount}</td></tr>`;

        debt.amount -= settledAmount;
        credit.amount -= settledAmount;

        if (debt.amount === 0) debts.shift();
        if (credit.amount === 0) credits.shift();
    }

    displayGroupStatistics();
    alert("Settlements calculated! Check the table.");
}

function displayGroupStatistics() {
    let groupStatsTable = document.querySelector("#group-stats-table tbody");
    groupStatsTable.innerHTML = "";
    
    stops.forEach(stop => {
        let participants = stop.participants.join(", ");
        groupStatsTable.innerHTML += `<tr><td>${stop.stopName}</td><td>${participants}</td><td>₹${stop.totalExpense}</td></tr>`;
    });
}

function showIndividualStats() {
    let name = prompt("Enter name of individual:");
    if (!people.includes(name)) {
        alert("Person not found!");
        return;
    }
    
    let individualStatsTable = document.querySelector("#individual-stats-table tbody");
    individualStatsTable.innerHTML = "";
    
    stops.forEach(stop => {
        if (stop.participants.includes(name)) {
            let paid = stop.payments[name] || 0;
            let owed = stop.amounts[name] || 0;
            let balance = paid - owed;
            individualStatsTable.innerHTML += `<tr><td>${stop.stopName}</td><td>₹${paid}</td><td>₹${owed}</td><td>₹${balance}</td></tr>`;
        }
    });
}
particlesJS("particles-js", {
    "particles": {
        "number": {
            "value": 100,
            "density": {
                "enable": true,
                "value_area": 800
            }
        },
        "color": {
            "value": "#00aaff"
        },
        "shape": {
            "type": "circle"
        },
        "opacity": {
            "value": 0.5,
            "random": true
        },
        "size": {
            "value": 4,
            "random": true
        },
        "line_linked": {
            "enable": true,
            "distance": 150,
            "color": "#00aaff",
            "opacity": 0.4,
            "width": 1
        },
        "move": {
            "enable": true,
            "speed": 2,
            "direction": "none",
            "random": false,
            "straight": false,
            "out_mode": "out",
            "bounce": false
        }
    },
    "interactivity": {
        "detect_on": "canvas",
        "events": {
            "onhover": {
                "enable": true,
                "mode": "repulse"
            },
            "onclick": {
                "enable": true,
                "mode": "push"
            }
        },
        "modes": {
            "repulse": {
                "distance": 100,
                "duration": 0.4
            },
            "push": {
                "particles_nb": 4
            }
        }
    },
    "retina_detect": true
});