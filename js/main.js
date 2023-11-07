const cardContainer = document.querySelector(".forecast-cards");
const locationElement = document.querySelector(".location");
const allBars = document.querySelectorAll(".clock");
const cityContainer = document.querySelector(".city-items")
const searchBox = document.getElementById("searchBox");
const findBnt = document.getElementById("submit");
const deleteBtn = document.getElementById("delete");

const apiKey = "b4f6a7cc6d514448ae7133125232208" ;
const baseUrl = `https://api.weatherapi.com/v1/forecast.json`;

const recentCities = JSON.parse(localStorage.getItem("cities")) || []


// let location = "cairo";

/*================================LOCATION===================================*/ 
function success(position){
let location = `${position.coords.latitude},${position.coords.longitude}`;
getWeather(location)
}
/*================================GET API===================================*/ 

async function getWeather(location){
    const res = await fetch(`${baseUrl}?key=${apiKey}&days=7&q=${location}`);
    if (res.status != 200) {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'Make sure you entered a valid city or Location',
        })
        searchBox.value = ""
        return
      }



        const data = await res.json();
        displayWeather(data);

   
}
getWeather("cairo")

function displayWeather(data) {
    locationElement.innerHTML = `<span class="city-name">${data.location.name}</span>,${data.location.country}`
    const days = data.forecast.forecastday;
    const now = new Date();
    let cardsHTML = '';
for(let [index , day] of days.entries()){
    

    const date = new Date(day.date);
   let weekday= date.toLocaleDateString('en-us' , {weekday:'long'});

    cardsHTML += `
      <div class="${index == 0 ? "card active" : "card"} col-md" data-index=${index} >
      <div class="card-header">
        <div class="day">${weekday}</div>
        <div class="time">${now.getHours()}:${now.getMinutes()} ${now.getHours() > 11 ? "pm" : "am"}</div>
      </div>
      <div class="card-body">
        <img src="./images/conditions/${day.day.condition.text}.svg"/>
        <div class="degree">${day.hour[now.getHours()].temp_c}°C</div>
      </div>
      <div class="text-center fw-bold"><span class="real-feel">${day.day.maxtemp_c}°C</span> / <span>${day.day.mintemp_c}°C</span></div>

      <div class="card-data">
        <ul class="left-column">
          <li>Real Feel: <span class="real-feel">${day.hour[now.getHours()].feelslike_c}°C</span></li>
          <li>Wind: <span class="wind">${day.hour[now.getHours()].wind_kph} K/h</span></li>
          <li>Pressure: <span class="pressure">${day.hour[now.getHours()].pressure_mb}Mb</span></li>
          <li>Humidity: <span class="humidity">${day.hour[now.getHours()].humidity}%</span></li>
        </ul>
        <ul class="right-column">
          <li>Sunrise: <span class="sunrise">${day.astro.sunrise}</span></li>
          <li>Sunset: <span class="sunset">${day.astro.sunset}</span></li>
        </ul>
      </div>
    </div>
    `
}
cardContainer.innerHTML= cardsHTML;
const allCards = document.querySelectorAll(".card");

  for (let card of allCards) {
    card.addEventListener("click", function (e) {
      const activeCard = document.querySelector(".card.active");
      activeCard.classList.remove("active")
      e.currentTarget.classList.add("active")
      displayRainInfo(days[e.currentTarget.dataset.index])
    })
  }
  let exist = recentCities.find((currentCity) => currentCity.city == data.location.name)
  if (exist) return
  recentCities.push({ city: data.location.name, country: data.location.country });
  localStorage.setItem("cities", JSON.stringify(recentCities))
  displayRecentCity(data.location.name , data.location.country)
}

function displayRainInfo(weather){
  for (let element of allBars) {
    // console.log(weather.hour[element.dataset.clock]);
// console.log(weather);
const clock = element.dataset.clock;
let height = weather.hour[clock].chance_of_rain
element.querySelector(".percent").style.height = `${height}%`
console.log(height);
  }
}

async function getCityImage(city , country) {
  const response = await fetch(`https://api.unsplash.com/search/photos?page=1&query=${city}&client_id=maVgNo3IKVd7Pw7-_q4fywxtQCACntlNXKBBsFdrBzI&per_page=5&orientation=landscape`)
  const data = await response.json();
  const random = Math.trunc(Math.random() * data.results.length)
  return data.results[random]
}
async function displayRecentCity(city, country) {
  let imgArr = await getCityImage(city);
console.log(imgArr.urls.regular);
let imgSrc = imgArr.urls.regular;
  if (imgArr) {
    let itemContent = `
  <div class="item">
    <div class="city-image">
      <img src="${imgSrc}" alt="Image for ${city} city" />
    </div>
    <div class="city-name"><span class="city-name">${city}</span>, ${country}</div>
  </div>
`;

    cityContainer.innerHTML += itemContent
  }
}
/*===============================EVENTS===================================*/ 
window.addEventListener("load", function(){
  navigator.geolocation.getCurrentPosition(success);
  for (let i = 0; i < recentCities.length; i++) {
    displayRecentCity(recentCities[i].city, recentCities[i].country)
  }
})


document.addEventListener("keyup", function (e) {
  if (e.key == "Enter") getWeather(searchBox.value);
})

findBnt.addEventListener("click" , function () {
  getWeather(searchBox.value)
})

deleteBtn.addEventListener("click" , function(){
  localStorage.removeItem("cities");
  location.reload()
})


