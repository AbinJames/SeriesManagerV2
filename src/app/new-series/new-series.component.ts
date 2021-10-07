import { Component, OnInit } from '@angular/core';
import { SeriesService } from '../shared-services/series.service';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-new-series',
  templateUrl: './new-series.component.html',
  styleUrls: ['./new-series.component.css']
})
export class NewSeriesComponent implements OnInit {
  newShows: any[] = [];

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    this.newShows = this.sharedDataService.getNewShows();
  }

  sortedSeriesList() {
    this.newShows.sort(function(a,b){
      return a.seriesName > b.seriesName ? 1 : -1;
    });
    return this.newShows;
  }

}
