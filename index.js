const aWlocationsautoCompleteURL = 'https://dataservice.accuweather.com/locations/v1/cities/autocomplete';
const aWFiveDayForecastURL = 'https://dataservice.accuweather.com/forecasts/v1/daily/5day/';
const aWApiKey = 'RaumfCQRZDqXV5eCgqkPt1TE2YXyqIxT';
let cities= [];
let days= [];
let locationKey;

function autoComplete(searchTerm, callBack) {
  const query = {
    apikey: aWApiKey,
    q: searchTerm,
    language: 'en-us'
  }
    let autoSettings = {
    url: aWlocationsautoCompleteURL,
    data: query,
    dataType: 'json',
    type: 'get',
    success: callBack
  }
  $.ajax(autoSettings);
}

function getFiveDayDataFromApi(location, callBack) {
  const fiveDaySettings = {
    url: aWFiveDayForecastURL + location,
    data: {
      details: true,
      apikey: aWApiKey,
      language: 'en-us'
    },
    dataType: 'JSON',
    type: 'get',
    success: callBack
  }
  $.ajax(fiveDaySettings).fail(showErr);
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
  })
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
  $('.forecastPage, .fiveDayForecast').removeClass('hidden');
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
}

function watchLocationClick() {
  $('.js-search-results').on('click', 'a' , function(event) {
    event.preventDefault();
    $('.js-search-results').addClass('hidden');
    $('.searchResultsContainer').addClass('hidden');
    let location = $(this).attr('data-location-key');
    locationKey = location;
    getFiveDayDataFromApi(location, displayForecastData);
  })
}

function renderLocation(locObject) {
  return `<li><a href='#' data-location-key='${locObject.Key}'>${locObject.LocalizedName}, ${locObject.AdministrativeArea.LocalizedName}, ${locObject.Country.LocalizedName}</a></li>`;
}

function displayLocationData(data) {
  if (data.length === 0) {
    console.log(data);
    $('.js-search-results').html('Please check spelling of city and try again')
                           .addClass("errorMsg");
  } else {
    cities = data;
    $('.js-search-results').html(data.map(renderLocation));
  }
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
    $('.forecastPage, .fiveDayForecast').addClass('hidden');
  })
}

$(watchDayClick);
$('.forecastPage, .fiveDayForecast').addClass('hidden');
$(watchSubmit);
$(watchLocationClick);
