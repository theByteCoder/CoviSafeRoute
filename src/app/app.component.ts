import { Component } from '@angular/core';
import { MapsAPILoader } from "@agm/core";
declare const google: any;

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  bounds = null;
  title = 'Corona Safe Route';
  lat: any;
  lng: any;
  city: any;
  public circle: any;
  readonly URL = 'https://www.covidhotspots.in/covid/city';

  getLatLong() {
    if (this.lng !== undefined) {
      return `Longitude : ${this.lng}  Latitude: ${this.lat}`;
    } else {
      return ""
    }
  }

  async getHostspots() {
    if (this.city !== undefined) {
      await fetch(`https://www.covidhotspots.in/covid/city/${this.city.replace(" ", "")}/hotspots`).then(response => response.json()).then(results => {
        this.circle = results;
      })
    }
  }

  splitGeocode(string, nb) {
    var array = string.split(',');
    return parseFloat(array[nb]);
  }

  constructor(private mapsAPILoader: MapsAPILoader) {
    this.mapsAPILoader.load().then(() => {
      this.bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(51.130739, -0.868052),
        new google.maps.LatLng(51.891257, 0.559417)
      );
      if (navigator) {
        navigator.geolocation.getCurrentPosition(pos => {
          this.lat = +pos.coords.latitude;
          this.lng = +pos.coords.longitude;
          this.getLocationName((result) => {
            this.city = result;
            this.getHostspots()
            document.getElementById(`city_${this.city}`).setAttribute('selected', '');
          });
          this.getHostspots();
        });
      }
    });
  }

  // onMapReady(map) {
  //   this.initDrawingManager(map);
  // }

  // initDrawingManager(map: any) {
  //   const options = {
  //     drawingControl: true,
  //     drawingControlOptions: {
  //       drawingModes: ["polygon"]
  //     },
  //     polygonOptions: {
  //       draggable: true,
  //       editable: true
  //     },
  //     drawingMode: google.maps.drawing.OverlayType.POLYGON
  //   };

  //   const drawingManager = new google.maps.drawing.DrawingManager(options);
  //   drawingManager.setMap(map);
  // }


  getLocationName(callback) {
    let latitude = this.lat, longitude = this.lng;
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return false;
    }
    let locationName;
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(latitude, longitude)
    geocoder.geocode({ 'latLng': latlng }, function (results, status) {
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          locationName = results[1].address_components[5].long_name;
        }
        else {
          locationName = "Unknown";
        }
      }
      else {
        locationName = `Error code: ${status}`;
      }
      callback(locationName);
    });
  }

}