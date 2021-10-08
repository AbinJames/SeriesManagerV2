import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SeriesService } from '../shared-services/series.service';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-new-series',
  templateUrl: './new-series.component.html',
  styleUrls: ['./new-series.component.css']
})
export class NewSeriesComponent implements OnInit {
  newShows: any[] = [];
  searchShows: any[] = [];
  seriesForm: FormGroup;
  options: any = null;
  data: any[] = [];
  constructor(private sharedDataService: SharedDataService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.newShows = this.sharedDataService.getNewShows();
    this.seriesForm = this.formBuilder.group({
      searchText: []
    });
    this.options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: false,
      headers: this.sharedDataService.headersRow,
      showTitle: false,
      title: 'asfasf',
      useBom: false,
      removeNewLines: true,
      keys: [this.sharedDataService.headersRow]
    };
    this.data = this.sharedDataService.seriesList;
  }

  sortedNewSeriesList() {
    this.newShows.sort(function(a,b){
      return a.seriesName > b.seriesName ? 1 : -1;
    });
    return this.newShows;
  }

  searchSeries(seriesForm: FormGroup) {
    this.searchShows = this.sharedDataService.searchNewShows(seriesForm.value.searchText);
  }

  sortedSearchSeriesList() {
    this.searchShows.sort(function(a,b){
      return a.seriesName > b.seriesName ? 1 : -1;
    });
    // console.log(this.searchShows);
    return this.searchShows;
  }

  addSeries(series, list) {
    this.options = {
      fieldSeparator: ',',
      quoteStrings: '"',
      decimalseparator: '.',
      showLabels: false,
      headers: this.sharedDataService.headersRow,
      showTitle: false,
      title: '',
      useBom: false,
      removeNewLines: true,
      keys: ['seriesId','apiId','seriesName','link']
    };
    this.data = this.sharedDataService.addSeries(series);
    if(list == 1) {
      var index = this.newShows.findIndex((obj => obj.seriesId == series.seriesId));
      this.newShows[index].isAdded = true;
    }
    if(list == 2) {
      var index = this.searchShows.findIndex((obj => obj.seriesId == series.seriesId));
      this.searchShows[index].isAdded = true;
    }
  }

}
