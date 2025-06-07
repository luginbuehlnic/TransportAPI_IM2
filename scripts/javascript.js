const details = document.querySelector('#details');
const stationButtons = document.querySelectorAll('.stationButton');
const trainBoxContainer = document.querySelector('.trainBox');
const loadingTrain = document.getElementById('loadingTrain');
const connectionBox = document.querySelector('.connectionBox');

let selectedFrom = '';
let selectedTo = '';   

// Add event listeners to station buttons
stationButtons.forEach(button => {
    button.addEventListener('click', () => {
        const id = button.id;
        const isFrom = id.includes('From');
        const group = isFrom ? 'from' : 'to';
        const groupDiv = document.getElementById(group);
        const stationName = button.innerText;

        groupDiv.querySelectorAll('.stationButton').forEach(btn => {
            btn.classList.remove('active');
        });

        button.classList.add('active');
        updateSelection(group, stationName);
    });
})

async function init() {}

//Get the selected Stations
async function updateSelection(group, stationName) {
    trainBoxContainer.innerHTML = '';
    if(group === 'from') {
        selectedFrom = stationName;
    } else if(group === 'to') {
        selectedTo = stationName;
    }
    
    if(selectedFrom === selectedTo) {
        sameStationWarning(selectedFrom);
    } else if(selectedFrom && selectedTo) {
        loadConnections(selectedFrom, selectedTo)
    }
}

// Show a warning if the same station is selected
async function sameStationWarning(station) {
    trainBoxContainer.innerHTML = '';
    const warningBox = document.createElement('div');
    warningBox.classList.add('warningBox');
    warningBox.innerHTML = `
        <h2>Bisch verwirrt?</h2>
        <img id="questionIcon" src="img/QuestionIcon.svg" alt="Question Icon">
        <h3>Du bisch scho in ${station} da gits kein Zug.</h3>
        <p>Probiers namal Neu</p>
    `;
    trainBoxContainer.appendChild(warningBox);

    if (trainBoxContainer) {
        trainBoxContainer.scrollIntoView({ behavior: 'smooth' });
    }
}

// Call Transport API and Load connections
async function loadConnections(from, to){
    const url = `http://transport.opendata.ch/v1/connections?from=${from}&to=${to}&limit=15`
    if(window.screen.width <= 850 && trainBoxContainer){
            trainBoxContainer.setAttribute('style', 'height: 50vh; overflow-y: auto;');
            trainBoxContainer.scrollIntoView({ behavior: 'smooth' });
    }
    loadingTrain.style.display = 'block';

    try {
        const response = await fetch(url);
        const data = await response.json();
        const directConnections = data.connections.filter(conn => conn.transfers === 0);
        if (directConnections.length >= 3) {
            data.connections = directConnections.slice(0, 3);
        } else {
            data.connections = directConnections;
        }
        dispayConnections(data.connections);
        
        if (trainBoxContainer) {
            trainBoxContainer.scrollIntoView({ behavior: 'smooth' });
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        return false
    } finally {
        loadingTrain.style.display = 'none';
    }
}

// Read Data from response and Display connections in the train box
async function dispayConnections(connections) {
    trainBoxContainer.setAttribute('style', 'height: auto; overflow-y: auto;');
    trainBoxContainer.innerHTML = '';
    connections.forEach(conn => {
        const fromTime = conn.from.departure.substring(11, 16);
        const toTime = conn.to.arrival.substring(11, 16);
        const fromStation = conn.from.station.name;
        const toStation = conn.to.station.name;
        const platform = conn.from.platform || '–';
        const name = conn.products[0] || 'Unbekannt';
        const parts = conn.duration.split('d')[1].split(':');
        const hours = parseInt(parts[0], 10);
        const minutes = parts[1];
        const duration = `${hours}:${minutes}h`;

        const box = document.createElement('div');
        box.classList.add('singleBox');
        box.innerHTML = `
            <div class="topBox">
                <div class="trainIcon">
                    <img class="smallTrain" src="img/RunnerLogoPurple.svg" alt="Train Icon">
                </div>
                <div class="route">
                    <p>${fromStation} - ${toStation}</p>
                </div>
                <div class="trainName">
                    <p>${name}</p>
                </div>
            </div>
            <div class="bottomBox">
                <div class="platform">
                    <p>Gleis ${platform}</p>
                </div>
                <div class="depart">
                    <p>${fromTime}</p>
                </div>
                <div class="lineDot">
                    <img src="img/LineDot.svg">
                </div>
                <div class="arrival">
                    <p>${toTime}</p>
                </div>
            </div>
            <div class="detailBox">
                <p class="duration">${duration}</p>
            </div>
        `;
        trainBoxContainer.appendChild(box);
    })
}

// Format Duration into hours and minutes
async function formatDuration(duration) {
    const parts = duration.split('d')[1].split(':');
    const hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    return `${hours}:${minutes}h`;
}

await init();