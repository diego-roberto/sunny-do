const { ipcRenderer } = require('electron');
var ipapi = require('ipapi.co');
const https = require('https');

var currentTempEl = document.getElementById('current-temp');
var currentCityEl = document.getElementById('current-city');
var conditionsEl = document.getElementById('weather-image');
var taskListEl = document.getElementById('task-list');
const newTaskBtn = document.getElementById('new-task-btn');

var city;
var lat
var lon;
var conditions;
var conditionsId;
var iconId;
var weatherIcon;
var currentTemp;
var tempUnit;
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

window.onload = function() {
  getLocation(function(city, lat, lon) {
    this.city = city;
    this.lat = lat;
    this.lon = lon;

    getWeather(function(err, data) {
      if (err) {
        console.log(err)
      } else {
        renderWeather(data)
      }
    })
  })
}

// conditionId
// Thunderstorm (2xx)
// Clouds (80x)
// Drizzle (3xx)
// Rain (id 5xx)
// Snow (6xx)
// Mist (701)
// Fog (741)
// Clear (800)

// Atmosphere (7xx)
// --use alert "../assets/images/alert.icon.png" icon instead--
// Smoke
// Haze
// Dust
// Sand
// Ash
// Squall
// Tornado


function renderWeather(data) {
  currentTempEl.innerText = `${data.main.temp.toFixed(1)}° ${tempUnit}`;
  currentCityEl.innerText = city;
  currentTempEl.setAttribute('title', city);
  conditionsEl.setAttribute('title', data.weather[0].description);

  var time = new Date().getHours();
  var iconSrc = getWeatherIcon(data.weather[0].id, time);
  conditionsEl.src = iconSrc;
}

function getWeatherIcon(conditionCode, time) {
  let icon;
  switch (conditionCode) {
    case 800:
      icon = (time >= 6 && time <= 18) ? 'sunny.html' : 'clear-night.html';
      break;
    case 801:
      icon = (time >= 6 && time <= 18) ? 'few-clouds-day.html' : 'few-clouds-night.html';
      break;
    case 802:
      icon = (time >= 6 && time <= 18) ? 'partly-cloudy-day.html' : 'partly-cloudy-night.html';
      break;
    case 803:
    case 804:
      icon = 'dark-clouds.html';
      break;
    case 701:
    case 741:
      icon = 'mist-fog.html';
      break;
    case 611:
    case 612:
      icon = (time >= 6 && time <= 18) ? 'patchy-sleet-day.html' : 'patchy-sleet-night.html';
      break;
    case 622:
    case 600:
    case 601:
    case 620:
      icon = (time >= 6 && time <= 18) ? 'snow-day.html' : 'snow-night.html';
      break;
    case 501:
    case 502:
    case 500:
      icon = (time >= 6 && time <= 18) ? 'rain-day.html' : 'rain-night.html';
      break;
    case 302:
      icon = 'drizzle.html';
      break;
    case 300:
    case 301:
      icon = (time >= 6 && time <= 18) ? 'patchy-drizzle-day.html' : 'patchy-drizzle-night.html';
      break;
    case 200:
      icon = 'thunderstorm.html';
      break;
    default:
      icon = 'sunny.html';
      break;
  }
  return `../assets/icons/${icon}`;
}

function getLocation(callback) {
  ipapi.location(function(res) {
    let city = res.city;
    let lat = res.latitude;
    let lon = res.longitude;
    callback(city, lat, lon);
  })
}

function getWeather(callback) {

  const exclude = "minutely,hourly,daily,alerts";
  const API_KEY = "40a75edebe5029821a92dfe5cf40b6dc"; //your API_KEY
  const units = "metric";

  if (units == "metric") {
    tempUnit = "C";
  }

  if (!city) {
    city = "Brasil";
  }
  if (!lat && !lon) {
    lat = '-10.000';
    lon = '-55.000';
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=${units}&exclude=${exclude}`;

  https.get(url, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    })

    response.on('end', () => {
      const weatherData = JSON.parse(data);
      /* always good to see what else the API provides: */
      // console.log("weatherData", weatherData)
      conditions = weatherData.weather[0].main;
      conditionsId = weatherData.weather[0].id;
      iconId = weatherData.weather[0].main.icon;
      currentTemp = weatherData.main.temp;
      callback(null, weatherData);
    })
  }).on('error', (error) => {
    callback(error, null)
  })

}

newTaskBtn.addEventListener('click', () => {
  const isOpen = ipcRenderer.sendSync('is-open-task-window')
  if (isOpen) {
    closeAddTaskWindow()
  }
  openAddTaskWindow()
})

function openAddTaskWindow() {
  ipcRenderer.send('open-add-task-window')
}

function closeAddTaskWindow() {
  ipcRenderer.send('close-add-task-window')
}

ipcRenderer.on('tasks', (event, tasks) => {
  taskListEl.innerHTML = '';
  const table = document.createElement('table');
  const header = document.createElement('tr');
  const nameHeader = document.createElement('th');
  nameHeader.innerText = 'task';
  const dateHeader = document.createElement('th');
  dateHeader.innerText = 'due date';
  const statusHeader = document.createElement('th');
  statusHeader.innerText = 'status';
  header.appendChild(nameHeader);
  header.appendChild(dateHeader);
  header.appendChild(statusHeader);
  table.appendChild(header);

  tasks.forEach(task => {
    const row = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.innerText = task.name;
    nameCell.setAttribute('id', 'td-name');

    const dateCell = document.createElement('td');
    dateCell.setAttribute('id', 'td-date');
    var formattedDate = '';
    if (task.date && !isNaN(new Date(task.date))) {
      var taskDate = new Date(task.date);
      formattedDate = `${taskDate.getDate()}/${months[taskDate.getMonth()]}/${taskDate.getFullYear()}`;
    } else {
      formattedDate = '∞';
    }
    dateCell.innerText = formattedDate;

    const statusCell = document.createElement('td');
    statusCell.innerText = task.status;
    statusCell.setAttribute('id', 'td-status');

    row.appendChild(nameCell);
    row.appendChild(dateCell);
    row.appendChild(statusCell);
    table.appendChild(row);
  });

  taskListEl.appendChild(table);
})

//custom close button (quit)
document.getElementById('close-button').addEventListener('click', () => {
  closeApp();
})
function closeApp() {
  ipcRenderer.send('quit-app')
}
