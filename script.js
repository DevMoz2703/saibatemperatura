const cityInput = document.querySelector(".city-input");
const searchButton = document.querySelector(".search-btn");
const locationButton = document.querySelector(".location-btn");
const currentWeatherDiv = document.querySelector(".current-weather");
const weatherCardsDiv = document.querySelector(".weather-cards");

const API_KEY = "0901a9e15cffd535484f71a5c90d427e";

const createWeatherCard = (cityName, weatherItem, index) => {
    if (index === 0) {
        return `<div class="details">
                    <h2> ${cityName} (${weatherItem.dt_txt.split(" ")[0]})
                    
                    <h6>Temperatura: ${(weatherItem.main.temp - 273.15).toFixed(2)} ºC</h6>
                    <h6>Vento: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidade: ${weatherItem.main.humidity}%</h6>
                </div>
                
                <div class="icon">
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    <h6> ${weatherItem.weather[0].description}</h6>
                </div>`;
        
    }else{//html para os 5 dias
        return `<li class="card">
                    <h3>(${weatherItem.dt_txt.split(" ")[0]})</h3>
                    <img src="https://openweathermap.org/img/wn/${weatherItem.weather[0].icon}@4x.png" alt="weather-icon">
                    
                    <h6>Temperatura: ${(weatherItem.main.temp - 273.15).toFixed(2)} ºC</h6>
                    <h6>Vento: ${weatherItem.wind.speed} M/S</h6>
                    <h6>Humidade: ${weatherItem.main.humidity}%</h6>
                </li>`;

    }
} 

const getWeatherDetails = (cityName, latitude, longitude) =>{
    const WEATHER_API_URL = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`;

    fetch(WEATHER_API_URL).then(response => response.json()).then(data => {
        //filtrar o forecasts para obter somente um forecast per day
        const uniqueForecastDays = [];
        const FiveDaysForecast = data.list.filter(forecast =>{
            const forecastDate = new Date(forecast.dt_txt).getDate();
            if (!uniqueForecastDays.includes(forecastDate)) {
                return uniqueForecastDays.push(forecastDate);
            }
        });

        //limpando previsao anterior
        cityInput.value = "";
        currentWeatherDiv.innerHTML = "";
        weatherCardsDiv.innerHTML = "";

        //criando cards de temperatura e adicionando ao dom
        FiveDaysForecast.forEach((weatherItem, index) =>{
            const html = createWeatherCard(cityName, weatherItem, index);
            if (index === 0) {
                currentWeatherDiv.insertAdjacentHTML("beforeend", html);
            }else{
                weatherCardsDiv.insertAdjacentHTML("beforeend", html);
            }
        });
    }).catch(() =>{
        alert("Ocorreu um erro enquanto a temperatura estava fetching!");
    });
}

const getCityCoordinates = () =>{
    const cityName = cityInput.value.trim();
    if (cityName === " ") return;

    const API_URL = `https://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=1&appid=${API_KEY}`;

    //obtendo coordenadas da api
    fetch(API_URL).then(response => response.json()).then(data =>{
        if (!data.length) return alert(`coordenadas nao encontradas para ${cityName}`);

        const{lat, lon, name} = data[0];
        getWeatherDetails(name, lat, lon);

    }).catch(() => {
        alert("algum erro encontrado nas coordenadas!");
    });
}

const getUserCoordinates = () => {
    navigator.geolocation.getCurrentPosition(
        position =>{
            const {latitude, longitude} = position.coords;//obtendo coordenadas do usuario

            //obtendo o nome da cidade a partir das coordenadas usando reverse geocoding api
            const API_URL = `https://api.openweathermap.org/geo/1.0/reverse?lat=${latitude}&lon=${longitude}&limit=1&appid=${API_KEY}`;

            fetch(API_URL).then(response => response.json()).then(data =>{
                const {name} = data[0];
                getWeatherDetails(name, latitude, longitude);
            }).catch(() =>{
                alert("erro ocorrido no fetching da cidade");
            });
        },
        error => {//mostrar alerta quando o acesso eh negado
            if (error.code === error.PERMISSION_DENIED) {
                alert("Geolocalizacao negada. Por favor reinicie a permissao.");
            }else{
                alert("Erro de geolocalizacao. Reinicie a localizacao");
            }
        }
    );
}

locationButton.addEventListener("click", getUserCoordinates);
searchButton.addEventListener("click", getCityCoordinates);
cityInput.addEventListener("keyup", e => e.key === "Enter" && getCityCoordinates());