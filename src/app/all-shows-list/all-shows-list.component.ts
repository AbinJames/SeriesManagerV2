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

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.seriesDetails = this.sharedDataService.getShowList();
    this.seriesImageList = this.sharedDataService.getShowImageList();
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
