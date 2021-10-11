import { isNgTemplate } from '@angular/compiler';
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-all-shows-list',
  templateUrl: './all-shows-list.component.html',
  styleUrls: ['./all-shows-list.component.css']
})
export class AllShowsListComponent implements OnInit {

  seriesDetails: any[] = [];
  seriesImageList: any[] = [];
  distinctDates: any[] = [];
  tomorrow = new Date();
  today = new Date();

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.today.setHours(0, 0, 0, 0);
    this.tomorrow.setDate(this.today.getDate() + 1);
    this.tomorrow.setHours(0, 0, 0, 0);
    this.seriesDetails = this.sharedDataService.getShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
    this.distinctDates = this.sharedDataService.distinctDates;
  }

  getDate(date) {
    var newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  }

  sortedSeriesList() {
    this.seriesDetails.sort(function(a,b){
      if (a.nextEpisodeAirdate === b.nextEpisodeAirdate) {
          return a.name > b.name ? 1 : -1;
      }
      return  +new Date(a.nextEpisodeAirdate) - +new Date(b.nextEpisodeAirdate);
    });
    return this.seriesDetails;
  }

  openShowDetails(series) {
    this.sharedDataService.viewDetailsPage(series);
  }

}
