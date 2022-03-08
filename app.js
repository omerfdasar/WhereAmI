'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const wait = function (seconds) {
  return new Promise(function (resolve) {
    setTimeout(resolve, seconds * 1000);
  });
};

const getJSON = function (url, errorMsg = 'Something went wrong') {
  return fetch(url).then(response => {
    if (!response.ok) throw new Error(`${errorMsg} (${response.status})`);

    return response.json();
  });
};

const renderCountry = function (data, className = '') {
  wait(1);
  const html = `
  <article class="country ${className}">
    <img class="country__img" src="${data.flags.png}" />
    <div class="country__data">
      <h3 class="country__name">${data.name.common}</h3>
      <h4 class="country__region">${data.region}</h4>
      <p class="country__row"><span>👫</span>${(
        +data.population / 1000000
      ).toFixed(1)} people</p>
      <p class="country__row"><span>🗣️</span>${
        data.languages[Object.keys(data.languages)[0]]
      }</p>
      <p class="country__row"><span>💰</span>${
        data.currencies[Object.keys(data.currencies)[0]].name
      }</p>
    </div>
  </article>
  `;
  countriesContainer.insertAdjacentHTML('beforeend', html);
  countriesContainer.style.opacity = 1;
  wait(1);
};
// Error handling
const renderError = function (msg) {
  countriesContainer.insertAdjacentText('beforeend', msg);
  countriesContainer.style.opacity = 1;
};

// // getting Data
const getCountryData = function (country) {
  // first country
  getJSON(`https://restcountries.com/v3.1/name/${country}`, `Country not found`)
    .then(data => {
      console.log(data);
      renderCountry(data[0]);
      const neighbour = data[0].borders;
      wait(2);
      if (!neighbour) throw new Error('No neighbour found!');
      // neighbour countries
      return neighbour.forEach(code => {
        getJSON(
          `https://restcountries.com/v3.1/alpha/${code}`,
          `Country not found `
        ).then(data => {
          setTimeout(() => {
            renderCountry(data[0], 'neighbour');
          }, 1000);
        });
      });
    })
    .catch(error => {
      renderError(`Something went Wrong?? => ${error.message}`);
    });
};

const whereAmI = function (lat, lng) {
  wait(1);
  getGeoData(lat, lng)
    .then(handleGeoData)
    .then(getCountryData)
    .catch(e => console.log(e));
};

const getGeoData = function (lat, lng) {
  return fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`).then(
    response => {
      if (!response.ok)
        throw new Error(`${response.status} | Too many requests per second`);
      return response.json();
    }
  );
};

const handleGeoData = function (data) {
  if (data.error) throw new Error(data.error.description);
  // if coords are not ok
  console.log(`You are in ${data.city}, ${data.country}`);
  //   getCountryAndNeighbours(`data.country`.toLocaleLowerCase);
  return data.country;
};

btn.addEventListener('click', function () {
  countriesContainer.innerHTML = '';
  navigator.geolocation.getCurrentPosition(({ coords }) => {
    whereAmI(coords.latitude, coords.longitude);
  });
});
