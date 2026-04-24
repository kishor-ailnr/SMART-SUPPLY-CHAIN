import axios from 'axios';

export class WeatherAgent {
  constructor() {
    this.cache = new Map(); // lat_lng_hour -> data
  }

  async getMarineWeather(lat, lng) {
    const roundedLat = Math.round(lat * 10) / 10;
    const roundedLng = Math.round(lng * 10) / 10;
    const hour = new Date().getUTCHours();
    const cacheKey = `${roundedLat}_${roundedLng}_${hour}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const url = `https://marine-api.open-meteo.com/v1/marine?latitude=${lat}&longitude=${lng}&hourly=wave_height,wind_wave_height,swell_wave_height,wave_period,wind_speed_10m,wind_direction_10m&forecast_days=3&timezone=UTC`;
      const response = await axios.get(url);
      
      const data = response.data.hourly;
      const index = 0; // Current hour
      
      const result = {
        waveHeight: data.wave_height[index],
        windSpeed: data.wind_speed_10m[index],
        swellHeight: data.swell_wave_height[index],
        wavePeriod: data.wave_period[index],
        windDirection: data.wind_direction_10m[index],
        timestamp: new Date().toISOString()
      };

      this.cache.set(cacheKey, result);
      // Simple cache cleanup
      if (this.cache.size > 1000) this.cache.clear();
      
      return result;
    } catch (error) {
      console.error(`Weather API failed for ${lat},${lng}:`, error.message);
      return { waveHeight: 1.0, windSpeed: 10, swellHeight: 0.5, wavePeriod: 6 }; // Default mild weather
    }
  }

  async getForecastForPath(path) {
    // path is [{lat, lng, hoursFromNow}]
    const forecast = [];
    for (const wp of path) {
      const weather = await this.getMarineWeather(wp.lat, wp.lng);
      forecast.push({ ...wp, weather });
    }
    return forecast;
  }
}
