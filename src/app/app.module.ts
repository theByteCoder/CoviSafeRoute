import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NgZone } from '@angular/core';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAXToOum9YMycph1nW6EZ-wCWnIbEB-ZMI',
      libraries: ['drawing', 'places']
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
