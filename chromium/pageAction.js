/*
This is the code that will run inside the connecteam scheduler tab
It will automatically place the Position View button on the screen as soon as the page is loaded
The process of using the downloaded csv file remains the same after that point
*/
function main() {

  console.log("%c [Θ_Θ] Watching connecteam SPA for schedules...", "color:green;");

  // Only run if document.url indicates shift scheduler:
  var url = document.URL;
  console.log(url);

  // observer waits for the button placement element to fully load before running inject
  const observer = new MutationObserver(function(mutationsList) {
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {

        // Only continue of the destination div is present
        const container = document.getElementsByClassName("multi-user-row-header")[0];
        if (container) {
          inject();
          observer.disconnect(); // stop the observer after success.
        }
      }
    }
  })

  // Check if page is valid immediately
  if (url.match(/shiftscheduler/) != null) {
    console.log("%c [Θ_Θ] Scheduling page located, waiting for element...", "color:green;");
    
    // start observer and wait
    observer.observe(document, { childList: true, subtree: true });
  }

  // Check url after page changes
  window.onhashchange = function() {
    url = document.URL;

    if (url.match(/shiftscheduler/) != null) {
      console.log("%c [Θ_Θ] Scheduling page located, waiting for element...", "color:green;");

      // start observer and wait
      observer.observe(document, { childList: true, subtree: true });
    }
  }
}


function sleep(ms) {
  return new Promise(function (r) {
    return setTimeout(r, ms);
  });
}

// when true, useful console.log statements will be printed to assist in debugging
const debugMode = true;

// Count number of times inject has run
var runTimes = 0;
const maxRuns = 1; // will normally run 6 times if not limited

// Primary functionality of script
function inject() {
  // Limit number of times this script can run
  if (runTimes < maxRuns) {
    runTimes++;

    console.log("%c [O_O] Element found! Placing the button...", "color:green;");

    // Define the button and behavior
    const button = document.createElement("button");
    button.innerHTML = "Position View";
    button.addEventListener("click", async function (e) {
      // Shifts
      console.log("%c [•_•] Getting shifts...", "color:green;");
      console.log("%c [-_-] This can take a while...", "color:yellow;");
      const shifts = await getShifts();

      // Positions
      console.log("%c [•_•] Getting positions...", "color:green;");
      const positions = getPositions(shifts);

      console.log("%c [ò_ó] My wait shall end shortly...", "color:red;");

      // Merge the two
      console.log("%c [•_•] Sorting positions...", "color:green;");
      const posShifts = await sortShifts(shifts, positions);

      // For now, export CSV
      console.log("%c [•_•] Exporting to CSV...", "color:green;");
      await exportCSV(posShifts);
    }); // end button definition

    // put the button in place
    const container = document.getElementsByClassName("multi-user-row-header")[0];
    container.appendChild(button);
  }
}

// Import CSV into excel for now  
function exportCSV(positionShifts) {
  // Create CSV text
  var csvString = "";
  for (var [position, shifts] of Object.entries(positionShifts)) {
    for (var shift of shifts) {
      const user = shift.user.match(/^\w+ \w/)[0];
      const start = shift.start;
      const end = shift.end;

      var csvRow = [position, user, start, end];
      csvString += csvRow + "\n";
    }
  }

  // Download CSV
  saveData(csvString, "shifts.csv");
}

// Download data
const saveData = (function () {
  // Create download container
  var dl = document.createElement("a");
  document.body.appendChild(dl);
  dl.style = "display:none;";

  return function (data, filename) {
    // Create blob and url
    const blob = new Blob([data], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);

    // Download blob
    dl.href = url;
    dl.download = filename;
    dl.click();
    window.URL.revokeObjectURL(url);
  };
})();

// Convert string time to js time
function parseTime(time) {
  // Get today's time
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const day = now.getDate();

  // Parse hour and minutes from time
  const [hourString, minuteString] = time.split(":");
  var hours = parseInt(hourString);
  var minutes = minuteString ? parseInt(minuteString.slice(0, -1)) : 0;

  // Modify for AM or PM
  var isPM = time.includes("p");
  if (isPM && hours != 12) hours += 12;
  else if (!isPM && hours == 12) hours = 0;

  // Return as Date object
  const date = new Date(year, month, day, hours, minutes);
  return date;
}

// Make it pretty
async function sortShifts(allShifts, positions) {
  var positionShifts = {};
  for (var [user, shifts] of Object.entries(allShifts)) {
    for (var shift of shifts) {
      // Get position
      const position = positions.find(function (p) {
        return shift.innerText.includes(p);
      });

      // Get start and end times
      const timeDuration = shift.innerText.slice(
        0,
        shift.innerText.indexOf(position)
      );
      var [startTime, endTime] = timeDuration.split(" - ");
      startTime = parseTime(startTime);
      endTime = parseTime(endTime);

      // Add result
      positionShifts[position] = !positionShifts[position]
        ? []
        : positionShifts[position];
      positionShifts[position].push({
        user: user,
        start: startTime,
        end: endTime,
      });
    }
  }

  return positionShifts;
}

// Obtain position names from collected shifts
function getPositions(allShifts) {
  const positions = new Set();
  for (var [name, shifts] of Object.entries(allShifts)) {
    shifts.forEach(function (shift) {
      if (debugMode) console.log(shift.innerHTML)
      // Pull shiftname from innerHTML (doublecheck regex here if shifts aren't showing up)
      const posName = shift.innerHTML.match(/">([-_ a-zA-Z0-9\/]+)<\/div>/)[1]
      if (debugMode) console.log(posName)
      positions.add(posName);
    });
  }

  return [...positions];
}

// *******************************************
// SCROLL TO TOP OF PAGE BEFORE RUNNING SCRIPT
// OTHERWISE THINGS WILL BREAK
// *******************************************
async function getShifts(e) {
  // Get days of week
  const daysContainer = document.querySelector("div.week-view-calendar-header");
  const days = daysContainer.getElementsByClassName("user-day-header-text");

  // Get number of users
  const res = await (
    await fetch("https://app.connecteam.com/api/UserDashboard/Chat/Users/", {
      referrer: "https://app.connecteam.com/index.html",
      referrerPolicy: "strict-origin-when-cross-origin",
      body: null,
      method: "GET",
      mode: "cors",
      credentials: "include",
    })
  ).json();
  const users = res.data.users;

  // Get start of grid
  const gridContainer = document.querySelector("div.week-view-calendar-body");
  var grid = [...gridContainer.querySelectorAll("div[data-index]")].filter(
    function (elem) {
      return elem.innerText != "Open to claim";
    }
  );

  // Get rest of users
  // Limit iterations to prevent infinite loop when using different schedules
  var maxIterations = 100;
  var iterations = 0;
  while (grid.length != users.length && iterations < maxIterations) {
    // set up scrolling behavior
    const scrollContainer = document.querySelector(
      "div.shift-scheduler-user-instance"
    );
    const scrollHeight = grid.slice(-5).reduce(function (sum, elem) {
      return sum + elem.scrollHeight * 2;
    }, 0);

    // scroll and wait for elements to load
    scrollContainer.scrollBy(0, scrollHeight);
    await sleep(100);

    // Get the new elements that have loaded
    const subgrid = [...gridContainer.querySelectorAll("div[data-index]")];
    subgrid.forEach(function (elem) {
      if (!grid.includes(elem) && elem.innerText != "Open to claim") {
        grid.push(elem);
      }
    });
	iterations += 1;
  }

  // Return only ones for current day
  var shifts = {};
  grid.forEach(function (row) {
    const name = row.firstChild.querySelector("div.multi-user-row-header")
      .lastChild.innerText;
    const times = [
      ...row.firstChild
        .querySelector("div.today-box")
        .querySelectorAll("div.week-shift"),
    ];
    shifts[name] = times;
  });
  if (debugMode) console.log(shifts)
  return shifts;
}

// Run
main();
