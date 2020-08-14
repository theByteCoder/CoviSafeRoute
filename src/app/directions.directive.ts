import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
declare var google: any;

export interface Geocord {
    latitude: number;
    longitude: number;
}

@Directive({
    selector: '[directionsMap]'
})

export class DirectionsMapDirective implements OnChanges {
    @Input() origin: Geocord;
    @Input() destination: Geocord;
    @Input() displayDirection: boolean;

    public directionsRenderer: any;

    constructor(private mapsApi: GoogleMapsAPIWrapper) { }

    // not required as directions will not be fetched during initial render
    // ngOnInit() {
    //     this.setDirections();
    // }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.destination || changes.displayDirection) {
            if (changes.displayDirection && !changes.displayDirection.currentValue) {
                if (this.directionsRenderer !== undefined) {
                    this.directionsRenderer.setDirections({ routes: [] });
                    return;
                }
            }
            // not required as this gets hit during initial render
            // where origin and destination are 0.0
            // else {
            //     this.setDirections();
            // }
        }
    }

    setDirections() {
        this.mapsApi.getNativeMap().then(map => {
            if (!this.directionsRenderer) {
                this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false, suppressInfoWindows: false, routeIndex: 1 });
            }
            const directionsRenderer = this.directionsRenderer;
            if (this.displayDirection && this.destination) {
                const directionsService = new google.maps.DirectionsService;
                directionsRenderer.setMap(map);
                directionsService.route({
                    origin: { lat: this.origin.latitude, lng: this.origin.longitude },
                    destination: { lat: this.destination.latitude, lng: this.destination.longitude },
                    provideRouteAlternatives: true,
                    travelMode: 'DRIVING'
                }, (response, status) => {
                    if (status === 'OK') {
                        directionsRenderer.setDirections(response);
                    }
                });
            }
        });
    }
}