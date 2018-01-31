const AW_locations_autoComplete_URL = 'http://dataservice.accuweather.com/locations/v1/cities/autocomplete';
const AW_One_Day_Forecast_URL = 'http://dataservice.accuweather.com/forecasts/v1/daily/1day/';
const AW_Ten_Day_Forecast_URL = 'http://dataservice.accuweather.com/forecasts/v1/daily/10day/';
const AW_API_KEY = 'RaumfCQRZDqXV5eCgqkPt1TE2YXyqIxT';

function autoComplete(searchTerm, callBack) {

 const query = {
   apikey: AW_API_KEY,
   q: searchTerm,
   language: 'en-us'
 }
   let autoSettings = {
   url: AW_locations_autoComplete_URL,
   data: query,
   dataType: 'json',
   type: 'get',
   success: callBack
 }
 $.ajax(autoSettings);
}




function get_One_Day_DataFromApi(location, callBack) {
 const one_Day_Settings = {
   url: AW_One_Day_Forecast_URL + location,
   data: {
     details: true,
     apikey: AW_API_KEY,
     language: 'en-us'
   },
   dataType: 'JSON',
   type: 'get',
   success: callBack
   };
 $.ajax(one_Day_Settings);
}

// function get_Ten_Day_DataFromApi(location, callBack) {
//  const ten_Day_Settings = {
//    url: AW_Ten_Day_Forecast_URL + location,
//    data: {
//      details: true,
//      apikey: AW_API_KEY,
//      language: 'en-us'
//    },
//    dataType: 'JSON',
//    type: 'get',
//    success: callBack
//  }
//  $.ajax(ten_Day_Settings);
// }
let cities= [];
let locationKey;

function getCurrentCity() {
  return cities.find(function(city) {
    return city.Key === locationKey;
  })
}

function getFullCityInfo() {
  return getCurrentCity().LocalizedName + ', ' + getCurrentCity().AdministrativeArea.LocalizedName;
}

function renderForecast(data) {
 let forecast = Object.keys(data).map(property => {
   return `<dt>${property}</dt><dd>${JSON.stringify(data[property])}</dd>`;
 });
 let iconNumber = data.Day.Icon;
 $('.js-forecast-results').addClass(`Icon-${iconNumber} Icon`);
 $('.js-forecast-phrase').html(data.Day.IconPhrase);
 $('.js-forecast-temp').html(`Low:  ${data.Temperature.Minimum.Value} º ${data.Temperature.Minimum.Unit} <br>High: ${data.Temperature.Maximum.Value} º ${data.Temperature.Maximum.Unit}`);
 $('.js-city-results').html(getFullCityInfo());
 // $('.js-forecast-temp').html();
 // $('.js-forecast-results').html('<dl>' + forecast.join('\n') + '</dl>');
 console.log(data.Date, data.Day);
}

function watchLocationClick() {
 $('.js-search-results').on('click', 'a' , function(event) {
   event.preventDefault();
   $('.js-search-results').addClass('hidden');
   let location = $(this).attr('data-location-key');
   locationKey = location;
   console.log(cities);
   get_One_Day_DataFromApi(location, displayForecastData);
 } )
}

function renderLocation(locObject) {
 return `<li><a href='#' data-location-key='${locObject.Key}'>${locObject.LocalizedName}, ${locObject.AdministrativeArea.LocalizedName}, ${locObject.Country.LocalizedName}</a></li>`;
}

function displayLocationData(data) {
 cities = data;
 $('.js-search-results').html(data.map(renderLocation));
}

function displayForecastData(data) {
 return data.DailyForecasts.map(renderForecast);
}

function watchSubmit() {
$('.js-form').on('submit', event => {
 event.preventDefault();
 $('.js-search-results').removeClass('hidden');
 let queryTarget = $(event.currentTarget).find('.js-query');
 let searchTerm = queryTarget.val();
 queryTarget.val("");
 autoComplete(searchTerm, displayLocationData);
})
}

$(watchSubmit);
$(watchLocationClick);
