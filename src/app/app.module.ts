import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { AgmCoreModule } from '@agm/core';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyAXToOum9YMycph1nW6EZ-wCWnIbEB-ZMI',
      libraries: ['drawing']
    })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
