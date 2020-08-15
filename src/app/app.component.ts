import { Component, ViewChild, ElementRef, NgZone, ChangeDetectionStrategy, Input, AfterViewInit } from '@angular/core';
import { MapsAPILoader } from "@agm/core";
declare const google: any;

import { DirectionsMapDirective, Geocord } from './directions.directive';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  changeDetection: ChangeDetectionStrategy.Default,
})

export class AppComponent implements AfterViewInit {
  bounds = null;
  title = 'Corona Safe Route';
  lat: any;
  lng: any;
  city: any;
  circle: any;
  address: any;
  web_site: any;
  name: any;
  zip_code: any;
  direction_origin: Geocord = {
    latitude: 0.0,
    longitude: 0.0,
  };
  direction_destination: Geocord = {
    latitude: 0.0,
    longitude: 0.0,
  };
  origin_newlatitude: any;
  origin_newlongitude: any;
  dest_newlatitude: any;
  dest_newlongitude: any;
  displayDirections = true;
  zoom = 14;
  origin_city: any;
  destination_city: any;
  readonly URL = 'https://www.covidhotspots.in/covid/city';

  @ViewChild('search') searchElementRef: ElementRef;
  @ViewChild('location_from') location_fromElementRef: ElementRef;
  @ViewChild('location_to') location_toElementRef: ElementRef;
  @ViewChild(DirectionsMapDirective) directive;
  @Input() origin;
  @Input() destination;

  ngAfterViewInit() {
    this.findAdress();
    this.findLocationFrom();
    this.findLocationTo();
  }

  onGetDirectionClick() {
    if (this.origin_newlatitude === undefined && this.origin_newlongitude === undefined) {
      this.direction_origin.latitude = this.lat
      this.direction_origin.longitude = this.lng
    } else {
      this.direction_origin.latitude = this.origin_newlatitude;
      this.direction_origin.longitude = this.origin_newlongitude;
    }
    this.direction_destination.latitude = this.dest_newlatitude;
    this.direction_destination.longitude = this.dest_newlongitude;
    if (this.origin_city !== undefined && this.destination_city !== undefined) {
      if (this.origin_city === this.destination_city) {
        this.city = this.origin_city | this.destination_city;
        // document.getElementById(`city_${this.city}`).setAttribute('selected', '');
        this.getHostspots()
      }
      // else {
      //   document.getElementById('cross-city_404_Hotspot_data').setAttribute('selected', '');
      // }
    }
    if (this.direction_destination.latitude !== undefined && this.direction_destination.longitude !== undefined) {
      this.directive.getDirections()
    }
  }

  getLatLong() {
    if (this.lng !== undefined) {
      return `Latitude: ${this.lat} Longitude : ${this.lng}`;
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
              item.radius = 30;
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
          this.getLocationName(this.lat, this.lng, (result) => {
            this.city = result;
            // this.cityInDropdown(this.city);
          });
          this.getHostspots();
        });
      }
    });
  }

  // cityInDropdown(cityName) {
  //   let citiesElem = document.getElementById("cities");
  //   if (citiesElem !== null) {
  //     if (citiesElem.innerHTML.indexOf('value="' + cityName + '"') > -1) {
  //       this.getHostspots()
  //       // document.getElementById(`city_${cityName}`).setAttribute('selected', '');
  //     }
  //     // else {
  //     //   document.getElementById("city_404_Hotspot_data").setAttribute('selected', '');
  //     // }
  //   }
  // }

  getLocationName(latitude, longitude, callback) {
    if (isNaN(parseFloat(latitude)) || isNaN(parseFloat(longitude))) {
      return false;
    }
    let locationName;
    let geocoder = new google.maps.Geocoder();
    let latlng = new google.maps.LatLng(latitude, longitude)
    geocoder.geocode({ 'latLng': latlng }, async function (results, status) {
      let all_cities = [];
      await fetch("https://www.covidhotspots.in/covid/cities")
        .then(response =>
          response.json()
        ).then(data => {
          for (let eachCity = 0; eachCity < data.length; eachCity++) {
            all_cities.push(data[eachCity]["city"]);
          }
        })
      if (status == google.maps.GeocoderStatus.OK) {
        if (results[1]) {
          results[1].address_components.map(item => {
            for (let key in item) {
              if (item.hasOwnProperty(key)) {
                if (item[key]['0'] === 'administrative_area_level_2' && item[key]['1'] === 'political') {
                  let locationName_2 = item['long_name'];
                  if (all_cities.includes(locationName_2)) {
                    locationName = locationName_2;
                    break;
                  }
                }
                if (item[key]['0'] === 'locality' && item[key]['1'] === 'political') {
                  let locationName_2 = item['long_name'];
                  if (all_cities.includes(locationName_2)) {
                    locationName = locationName_2;
                    break;
                  }
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
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.address = place.formatted_address;
          this.web_site = place.website;
          this.name = place.name;
          this.zip_code = place.address_components[place.address_components.length - 1].long_name;
          this.lat = place.geometry.location.lat();
          this.lng = place.geometry.location.lng();
          this.getLocationName(this.lat, this.lng, (result) => {
            this.city = result;
            // this.getHostspots();
            // document.getElementById(`city_${this.city}`).setAttribute('selected', '');
            // this.cityInDropdown(this.city);
          });
          this.getHostspots();
        });
      });
    });
  }

  findLocationFrom() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.location_fromElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        new NgZone({}).run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.address = place.formatted_address;
          this.web_site = place.website;
          this.name = place.name;
          this.zip_code = place.address_components[place.address_components.length - 1].long_name;
          this.origin_newlatitude = place.geometry.location.lat();
          this.origin_newlongitude = place.geometry.location.lng();
          if (this.origin_newlatitude !== undefined && this.origin_newlongitude !== undefined) {
            this.getLocationName(this.origin_newlatitude, this.origin_newlongitude, (result) => {
              this.origin_city = result;
            });
          }
        });
      });
    });
  }

  findLocationTo() {
    this.mapsAPILoader.load().then(() => {
      let autocomplete = new google.maps.places.Autocomplete(this.location_toElementRef.nativeElement);
      autocomplete.addListener("place_changed", () => {
        new NgZone({}).run(() => {
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          this.address = place.formatted_address;
          this.web_site = place.website;
          this.name = place.name;
          this.zip_code = place.address_components[place.address_components.length - 1].long_name;
          this.dest_newlatitude = place.geometry.location.lat();
          this.dest_newlongitude = place.geometry.location.lng();
          if (this.dest_newlatitude !== undefined && this.dest_newlongitude !== undefined) {
            this.getLocationName(this.dest_newlatitude, this.dest_newlongitude, (result) => {
              this.destination_city = result;
            });
          }
        });
      });
    });
  }
}