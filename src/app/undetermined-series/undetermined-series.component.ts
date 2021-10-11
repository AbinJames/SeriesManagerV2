import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-undetermined-series',
  templateUrl: './undetermined-series.component.html',
  styleUrls: ['./undetermined-series.component.css']
})
export class UndeterminedSeriesComponent implements OnInit {

  seriesDetails: any[] = [];
  seriesImageList: any[] = [];

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.seriesDetails = this.sharedDataService.getShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
  }

  sortedSeriesList() {
    this.seriesDetails.sort(function (a, b) {
      return a.name > b.name ? 1 : -1;
    });
    return this.seriesDetails;
  }

  openShowDetails(series) {
    this.sharedDataService.viewDetailsPage(series);
  }

}
