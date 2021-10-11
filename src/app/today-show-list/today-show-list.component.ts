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

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit(): void {
    this.seriesDetails = this.sharedDataService.getTodayShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
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
