/** @format */

import React, { Component } from 'react'
import './css/App.css'

import SearchBar from './components/SearchBar'
import WeatherCard from './components/Weather'
import Favourites from './components/FavouriteCities'
import API_KEY from './config.js'

class App extends Component {
  constructor(props) {
    super(props)
    this.state = {
      weatherData: {
        weather: '',
        city: '',
        country: '',
        temp: 0,
      },
      searchDone: false,
      savedCities: [],
      hasSavedCities: false,
      errorMessage: '',
    }

    this.callWeatherData = this.callWeatherData.bind(this)
    this.updateSavedCities = this.updateSavedCities.bind(this)
  }

  // save previous search to localStorage

  callWeatherData(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&APPID=${API_KEY}`
    fetch(url)
      .then(handleErrors)
      .then(resp => resp.json())
      .then(data => {
        const weatherObj = {
          weather: data.weather,
          city: data.name,
          country: data.sys.country,
          temp: data.main.temp,
          main: data.main,
          wind: data.wind,
          humidity: data.main.humidity,
          wind_direction: data.wind.deg,
          pressure: data.main.pressure,
          sunrise: data.sys.sunrise,
          visibility: data.visibility,
          sunset: data.sys.sunset,
        }
        this.setState({
          weatherData: weatherObj,
          searchDone: true,
          errorMessage: '',
        })
      })
      .catch(error => {
        // If an error is catch, it's sent to SearchBar as props
        this.setState({ errorMessage: error.message })
      })

    function handleErrors(response) {
      if (!response.ok) {
        throw Error(response.statusText)
      }
      return response
    }
  }

  // store the previous searches to localStorage in a recentlySearched array and time it was searched
  componentDidUpdate(prevProps, prevState) {
    if (prevState.weatherData.city !== this.state.weatherData.city) {
      const recentlySearched =
        JSON.parse(localStorage.getItem('recentlySearched')) || []
      const time = new Date().toLocaleString()
      const newSearch = {
        city: this.state.weatherData.city,
        time: time,
      }
      recentlySearched.push(newSearch)
      localStorage.setItem('recentlySearched', JSON.stringify(recentlySearched))
    }
  }

  // componentDidUpdate(prevProps, prevState) {
  //   if (prevState.weatherData.city !== this.state.weatherData.city) {
  //     const recentlySearched =
  //       JSON.parse(localStorage.getItem('recentlySearched')) || []
  //     const city = this.state.weatherData.city
  //     if (recentlySearched.includes(city)) {
  //       const index = recentlySearched.indexOf(city)
  //       recentlySearched.splice(index, 1)
  //     }
  //     recentlySearched.unshift(city)
  //     localStorage.setItem('recentlySearched', JSON.stringify(recentlySearched))
  //   }
  // }

  updateSavedCities(cityArr) {
    // hasCities is set to true if length is more than 0, otherwise false
    const hasCities = cityArr.length > 0
    this.setState({ savedCities: cityArr, hasSavedCities: hasCities })
  }

  componentWillMount() {
    // See if there's saved cities in localStorage before the App is mounted
    // Tests didn't like parsing when localStorage.getItem was undefined, so this was my solution for it
    let existingCities = JSON.parse(localStorage.getItem('cityList') || '[]')

    if (existingCities.length !== 0) {
      this.setState({
        hasSavedCities: true,
        savedCities: existingCities,
      })
    }
    // save the previous search to localStorage if there's any
    this.updateSavedCities(existingCities)
  }

  render() {
    const {
      searchDone,
      weatherData,
      hasSavedCities,
      savedCities,
      errorMessage,
    } = this.state

    return (
      <div className="App">
        <SearchBar
          callBackFromParent={this.callWeatherData}
          error={errorMessage}
        />
        {searchDone && (
          <WeatherCard
            weatherData={weatherData}
            savedCities={savedCities}
            callBackFromParent={this.updateSavedCities}
          />
        )}
        <div className="recently-searched">
          <h2>Recently Searched</h2>
          <ul>
            {JSON.parse(localStorage.getItem('recentlySearched')) &&
              JSON.parse(localStorage.getItem('recentlySearched')).map(
                (city, index) => (
                  <li key={index}>
                    {city.city} - {city.time}
                    <button
                      className="search-button"
                      onClick={() => this.callWeatherData(city.city)}></button>
                  </li>
                )
              )}
          </ul>
          <div
            // clear button to clear recently searched list
            className="clear-button"
            onClick={() => {
              localStorage.removeItem('recentlySearched')
              this.setState({})
            }}>
            Clear
          </div>
        </div>

        {hasSavedCities && (
          <Favourites
            savedCities={savedCities}
            callBackFromParent={this.callWeatherData}
          />
        )}
      </div>
    )
  }
}

export default App
