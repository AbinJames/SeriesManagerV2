import { formatDate } from "@angular/common";
import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-anime',
  templateUrl: './anime.component.html',
  styleUrls: ['./anime.component.css']
})
export class AnimeComponent implements OnInit {

  seriesDetails: any[] = [];
  seriesImageList: any[] = [];
  distinctDates: any[] = [];
  filteredSeries: any[] = [];
  tomorrow = new Date();
  today = new Date();
  yesterday = new Date();
  seriesCount = 0;
  optionSize = 0;

  constructor(private sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.seriesDetails = this.sharedDataService.getShowList()
    this.seriesImageList = this.sharedDataService.getShowImageList();
  }

  sortedSeriesList() {
    this.seriesDetails.sort(function (a, b) {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1;
    });
    return this.seriesDetails.filter(series => series.genres.includes('Anime'));;
  }

  openShowDetails(series) {
    this.sharedDataService.viewDetailsPage(series);
  }

}
