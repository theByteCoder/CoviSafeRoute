import { Component, ViewChild, ElementRef, AfterViewInit, NgZone } from '@angular/core';
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
  circle: any;
  // ngZone: any;
  address: any;
  web_site: any;
  name: any;
  zip_code: any;
  zoom: any;
  readonly URL = 'https://www.covidhotspots.in/covid/city';

  @ViewChild('search') searchElementRef: ElementRef;

  getLatLong() {
    if (this.lng !== undefined) {
      return `Longitude : ${this.lng}  Latitude: ${this.lat}`;
    } else {
      return ""
    }
  }

  async getHostspots() {
    if (this.city !== undefined) {
      await fetch(`${this.URL}/${this.city.replace(" ", "")}/hotspots`)
        .then(response => response.json())
        .then(results => {
          let res = results.map(item => {
            if (item.hasOwnProperty("geocord")) {
              item.lat = parseFloat(item["geocord"].split(',')[0]);
              item.lng = parseFloat(item["geocord"].split(',')[1]);
              item.radius = 100;
              item.color = item.zone.toLowerCase()
            }
            // delete item["geocord"];
            // delete item["name"];
            // delete item["updatedAt"];
            // delete item["zone"];
            return {
              ...item
            }
          })
          this.circle = res;
          // this.circle = [{ lat: 22.649865, lng: 88.3985632, radius: 800, color: 'red' },
          // { lat: 22.6822535, lng: 88.4390899, radius: 800, color: 'red' }];
        })
    }
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
          results[1].address_components.map(item => {
            for (var key in item) {
              if (item.hasOwnProperty(key)) {
                if (item[key]['0'] === 'locality' && item[key]['1'] === 'political') {
                  locationName = item['long_name'];
                  break;
                }
              }
            }
          })
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

  findAdress() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        new NgZone({}).run(() => {
          // some details
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.address = place.formatted_address;
          this.web_site = place.website;
          this.name = place.name;
          this.zip_code = place.address_components[place.address_components.length - 1].long_name;
          //set latitude, longitude and zoom
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.getLocationName((result) => {
            this.city = result;
            this.getHostspots()
            document.getElementById(`city_${this.city}`).setAttribute('selected', '');
          });
          this.getHostspots();
        });
      });
    });
  }

  ngAfterViewInit() {
    this.findAdress();
  }

}