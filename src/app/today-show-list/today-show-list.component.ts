import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-today-show-list',
  templateUrl: './today-show-list.component.html',
  styleUrls: ['./today-show-list.component.css']
})
export class TodayShowListComponent implements OnInit {

  seriesDetails: any[] = [];
  seriesImageList: any[] = [];
  seriesCount = 0;

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    this.seriesDetails = this.sharedDataService.getTodayShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
  }

  getCount() {
    this.seriesCount = this.seriesDetails.length;
    return this.seriesCount;
  }

  sortedSeriesList() {
    this.seriesDetails.sort(function (a, b) {
      return a.seriesName.toLowerCase() > b.seriesName.toLowerCase() ? 1 : -1;
    });
    return this.seriesDetails;
  }

  openShowDetails(series) {
    this.sharedDataService.viewDetailsPage(series);
  }

}
