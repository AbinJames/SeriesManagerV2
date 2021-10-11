import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthGuard } from './shared-services/auth-guard.service';
import { LoginComponent } from './login/login.component';
import { TodayShowListComponent } from './today-show-list/today-show-list.component';
import { NewSeriesComponent } from './new-series/new-series.component';
import { AllShowsListComponent } from './all-shows-list/all-shows-list.component';
import { ShowDetailsComponent } from './show-details/show-details.component';
import { UndeterminedSeriesComponent } from './undetermined-series/undetermined-series.component';
import { EndedSeriesComponent } from './ended-series/ended-series.component';

const routes: Routes = [
  { path: '', component: DashboardComponent },
  // {path: 'dashboard', canActivate: [AuthGuard], component: DashboardComponent},
  { path: 'dashboard', component: DashboardComponent },
  { path: 'allseries', component: AllShowsListComponent },
  { path: 'undetermined', component: UndeterminedSeriesComponent },
  { path: 'ended', component: EndedSeriesComponent },
  { path: 'today', component: TodayShowListComponent },
  { path: 'newtoday', component: NewSeriesComponent },
  { path: 'showdetails/:type', component: ShowDetailsComponent }
]


@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
