import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { HeaderComponent } from './header/header.component';
import { FooterComponent } from './footer/footer.component';
import { LoginComponent } from './login/login.component';
import { HttpClientModule } from '@angular/common/http';
import { AllShowsListComponent } from './all-shows-list/all-shows-list.component';
import { TodayShowListComponent } from './today-show-list/today-show-list.component';
import { NewSeriesComponent } from './new-series/new-series.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Angular2CsvModule } from 'angular2-csv';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { UndeterminedSeriesComponent } from './undetermined-series/undetermined-series.component';
import { EndedSeriesComponent } from './ended-series/ended-series.component';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    HeaderComponent,
    FooterComponent,
    LoginComponent,
    AllShowsListComponent,
    TodayShowListComponent,
    NewSeriesComponent,
    ShowDetailsComponent,
    UndeterminedSeriesComponent,
    EndedSeriesComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    Angular2CsvModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
