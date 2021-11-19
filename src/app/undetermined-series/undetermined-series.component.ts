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
  seriesCount = 0;

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.seriesDetails = this.sharedDataService.getShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
  }

  getCount() {
    var res = this.seriesDetails.filter(series => !series.next && series.status != 'Ended');
    this.seriesCount = res.length;
    return this.seriesCount;
  }

  sortedSeriesList() {
    this.seriesDetails.sort(function (a, b) {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
    return this.seriesDetails;
  }

  openShowDetails(series) {
    this.sharedDataService.viewDetailsPage(series);
  }

}
