const AW_locations_autoComplete_URL = 'http://dataservice.accuweather.com/locations/v1/cities/autocomplete';
const AW_One_Day_Forecast_URL = 'http://dataservice.accuweather.com/forecasts/v1/daily/1day/';
const AW_Five_Day_Forecast_URL = 'http://dataservice.accuweather.com/forecasts/v1/daily/5day/';
const AW_API_KEY = 'RaumfCQRZDqXV5eCgqkPt1TE2YXyqIxT';

let cities= [];
let days= [];
let locationKey;

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

// function get_One_Day_DataFromApi(location, callBack) {
//  const one_Day_Settings = {
//    url: AW_One_Day_Forecast_URL + location,
//    data: {
//      details: true,
//      apikey: AW_API_KEY,
//      language: 'en-us'
//    },
//    dataType: 'JSON',
//    type: 'get',
//    success: callBack
//    };
//  $.ajax(one_Day_Settings);
// }

function get_Five_Day_DataFromApi(location, callBack) {
 const five_Day_Settings = {
   url: AW_Five_Day_Forecast_URL + location,
   data: {
     details: true,
     apikey: AW_API_KEY,
     language: 'en-us'
   },
   dataType: 'JSON',
   type: 'get',
   success: callBack
 }
 $.ajax(five_Day_Settings);
 // console.log(five_Day_Settings);
}

function getCurrentCity() {
  return cities.find(function(city) {
    return city.Key === locationKey;
  })
}

function getFullCityInfo() {
  return getCurrentCity().LocalizedName + ', ' + getCurrentCity().AdministrativeArea.LocalizedName;
}

function getForecastTarget(index) {
  return $(`.day${index + 1}`);
}

function watchDayClick() {
  $('.day').on('click', function() {
    let index = parseInt($(this).index(), 10);
    console.log(index, $(this).attr('class'));
    showForecastDetails(index);
  } )
}

function showForecastDetails(dayIndex) {
  const data = days[dayIndex];
  console.log(dayIndex, data);
  let d = new Date(Date.parse(data.Date));
  let options = {
     weekday: "long", year: "numeric", month: "short",
     day: "numeric", hour: "2-digit", minute: "2-digit"
  };
  let localDate = d.toLocaleTimeString("en-us", options).slice(0,-9)
  $('.container-2, .container-3').removeClass('hidden');
  $('.js-forecast-results').attr('class', `js-forecast-results Icon-${data.Day.Icon} Icon`);
  $('.js-forecast-phrase').html(data.Day.IconPhrase);
  $('.js-forecast-temp').html(`Low:  ${data.Temperature.Minimum.Value} º ${data.Temperature.Minimum.Unit} <br>High: ${data.Temperature.Maximum.Value} º ${data.Temperature.Maximum.Unit}`);
  $('.js-city-result').html(getFullCityInfo());
  $('.js-date-time-result').html(localDate);

}

function renderForecast(data, index, days) {
 let forecast = Object.keys(data).map(property => {
   return `<dt>${property}</dt><dd>${JSON.stringify(data[property])}</dd>`;
 });
 let iconNumber = data.Day.Icon;
 let d = new Date(Date.parse(data.Date));
 let options = {
    weekday: "long", year: "numeric", month: "short",
    day: "numeric", hour: "2-digit", minute: "2-digit"
 };
 let target = getForecastTarget(index);
 let localDate = d.toLocaleTimeString("en-us", options).slice(0, 3);
 target.html(localDate).addClass(`Icon-${iconNumber} Icon`);
 // console.log(data);

 // $('.js-forecast-results').html('<dl>' + forecast.join('\n') + '</dl>');
 // $('.container-3').removeClass('hidden');
 // console.log(data.Date, data.Day);
}

function watchLocationClick() {
 $('.js-search-results').on('click', 'a' , function(event) {
   event.preventDefault();
   $('.js-search-results').addClass('hidden');
   $('.searchResultsContainer').addClass('hidden');
   let location = $(this).attr('data-location-key');
   locationKey = location;
   // get_One_Day_DataFromApi(location, displayForecastData);
   get_Five_Day_DataFromApi(location, displayForecastData);
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
 days = data.DailyForecasts;
 data.DailyForecasts.map(renderForecast);
 console.log(days);
 showForecastDetails(0);

}

function watchSubmit() {
  $('.js-form').on('submit', event => {
   event.preventDefault();
   $('.js-search-results').removeClass('hidden');
   $('.searchResultsContainer').removeClass('hidden');
   let queryTarget = $(event.currentTarget).find('.js-query');
   let searchTerm = queryTarget.val();
   queryTarget.val("");
   autoComplete(searchTerm, displayLocationData);
   $('.container-2, .container-3').addClass('hidden');
   // console.log("wtf");
  })
}


$(watchDayClick);
$('.container-2, .container-3').addClass('hidden');
$(watchSubmit);
$(watchLocationClick);
