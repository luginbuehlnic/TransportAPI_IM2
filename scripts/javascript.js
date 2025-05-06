const connection_Buttons = document.querySelector('#connections');
const connection_name = document.querySelector('#name');
const connection_duration = document.querySelector('#duration');
const connection_from = document.querySelector('#from');
const connection_platform = document.querySelector('#platform');
const connection_arriveplt = document.querySelector('#arriveplt');
const connection_to = document.querySelector('#to');
const connection_departure = document.querySelector('#departure');
const connection_arrival = document.querySelector('#arrival');
const details = document.querySelector('#details');

const connections = [
    {
        from: 'Zürich HB',
        to: 'Chur'
    },
    {
        from: 'Chur',
        to: 'Zürich HB'
    },
    {
        from: 'St. Gallen',
        to: 'Chur'
    },
    {
        from: 'Chur',
        to: 'St. Gallen'
    }
]

async function init() {
    details.style.display = 'none';

    await initConnectionButtons()

    // let result = await loadConnections('Chur', 'Zürich HB');
    // console.log(result);

    // connection_duration.innerText = formatDuration(result[0].duration);
    // connection_name.innerText = result[0].products[0];
}

async function initConnectionButtons() {
    if(!connection_Buttons) return;
    details.style.display = 'none';
    connection_Buttons.innerHTML = '';

    for(const connection of connections) {
        const button = document.createElement('button');
        button.innerText = `${connection.from} - ${connection.to}`;
        button.classList.add('connection-button');
        button.addEventListener('click', async () => {
            connection_from.innerText = connection.from;
            connection_to.innerText = connection.to;

            const connections = await loadConnections(connection.from, connection.to);
            console.log(connections);

            connection_duration.innerText = formatDuration(connections[0].duration);
            connection_name.innerText = connections[0].products[0];
            connection_platform.innerText = ` Gleis ${connections[0].from.platform}`;
            connection_arriveplt.innerText = ` Gleis ${connections[0].to.platform}`;
            connection_departure.innerText = new Date(connections[0].from.departure).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Berlin',
              });
            connection_arrival.innerText = new Date(connections[0].to.arrival).toLocaleTimeString('de-DE', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Europe/Berlin',
              });
            
        });


        details.style.display = 'block';
        connection_Buttons.appendChild(button);
    }
}

async function loadConnections(from, to){
    // let from = 'Chur',
    //     to = 'Zürich HB';
    const url = `http://transport.opendata.ch/v1/connections?from=${from}&to=${to}&limit=1`

    try {
        const response = await fetch(url);
        const data = await response.json();
        const connections = data.connections;
        return connections
    } catch (error) {
        return false
        console.error('Error fetching data:', error);
    }
}

function formatDuration(duration) {
    const [_, time] = duration.split('d');
    const [hours, minutes] = time.split(':').map(Number);
  
    const parts = [];
    if (hours) parts.push(`${hours} Std`);
    if (minutes) parts.push(`${minutes} Min`);
  
    return parts.join(' ') || '0 Min';
  }

await init();