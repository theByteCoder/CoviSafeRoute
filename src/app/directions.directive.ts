import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { GoogleMapsAPIWrapper } from '@agm/core';
declare let google: any;

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
    stepDisplay: any;
    markerArray = [];

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

    getDirections() {
        let isPathSafe = {};
        this.mapsApi.getNativeMap().then(map => {
            if (!this.directionsRenderer) {
                this.directionsRenderer = new google.maps.DirectionsRenderer({ suppressMarkers: false, suppressInfoWindows: false });
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
                }, async (response, status) => {
                    if (status === 'OK') {
                        let paths = this.morphResponse(response);
                        await fetch('https://www.covidhotspots.in/covid/directions', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({
                                'destination': `${this.destination.latitude}, ${this.destination.longitude}`,
                                'origin': `${this.origin.latitude}, ${this.origin.longitude}`,
                                'paths': paths,
                            }),
                        })
                            .then((res) => res.json())
                            .then((data) => {
                                isPathSafe = { ...data };
                            })
                        for (let eachRoute = 0; eachRoute < response.routes.length; eachRoute++) {
                            let directionsRenderer_eachRoute = new google.maps.DirectionsRenderer();
                            if (isPathSafe['paths'][eachRoute].path === response.routes[eachRoute].overview_polyline) {
                                if (isPathSafe['paths'][eachRoute].pathPassesContainmentZone) {
                                    directionsRenderer_eachRoute.setOptions({
                                        polylineOptions: {
                                            strokeColor: 'red'
                                        }
                                    });
                                }
                            }
                            directionsRenderer_eachRoute.setDirections(response);
                            directionsRenderer_eachRoute.setRouteIndex(eachRoute);
                            directionsRenderer_eachRoute.setMap(map);
                        }
                    }
                });
            }
        });
    }

    morphResponse(response) {
        const morphedResponse = []
        for (let eachPath = 0; eachPath < response.routes.length; eachPath++) {
            let result = {
                'order': eachPath + 1,
                'path': response.routes[eachPath].overview_polyline
            }
            morphedResponse.push(result);
        }
        return morphedResponse
    }

    attachInstructionText(marker, text, map) {
        google.maps.event.addListener(marker, 'click', function () {
            this.stepDisplay.setContent(text);
            this.stepDisplay.open(map, marker);
        });
    }

    showSteps(directionResult, map) {
        let route = directionResult.routes[0].legs[0];
        for (let eachStep = 0; eachStep < route.steps.length; eachStep++) {
            let marker = new google.maps.Marker({
                position: route.steps[eachStep].start_point,
                map: map
            });
            this.attachInstructionText(marker, route.steps[eachStep].instructions, map);
            this.markerArray[eachStep] = marker;
        }
    }
}