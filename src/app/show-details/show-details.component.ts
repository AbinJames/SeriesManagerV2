import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-show-details',
  templateUrl: './show-details.component.html',
  styleUrls: ['./show-details.component.css']
})
export class ShowDetailsComponent implements OnInit {


  constructor(public router: Router, private sharedDataService: SharedDataService, private formBuilder: FormBuilder) { }

  series: any = null;
  activeTab: number = 0;
  activeSeasonTab: number = 0;
  today = new Date();
  showForm: FormGroup;
  isDataLoaded: boolean = false;

  ngOnInit(): void {
    this.series = {
      image: null,
      name: "nil",
      status: "nil",
      summary: "nil",
    }
    this.showForm = this.formBuilder.group({
      newLink: ""
    });
    var seriesId = parseInt(this.router.url.toString().replace('/showdetails/', ''));
    this.series = this.sharedDataService.getSeries(seriesId);

    this.sharedDataService.changePageClicked
      .subscribe(
        (seriesId: any) => {
          this.series = this.sharedDataService.getSeries(seriesId);
          this.activeTab = 1;
          setTimeout(() => {
            this.series.seasons.seasonList.forEach(season => {
              if (this.activeSeasonTab < season.number) {
                this.activeSeasonTab = season.number;
              }
            });
            this.isDataLoaded = true;
          }, 2000);
        }
      );
  }

  ngAfterContentInit(): void {
    this.activeTab = 1;
    setTimeout(() => {
      this.series.seasons.seasonList.forEach(season => {
        if (this.activeSeasonTab < season.number) {
          this.activeSeasonTab = season.number;
        }
      });
      this.isDataLoaded = true;
    }, 2000);

  }

  getSeasonList() {
    return this.series.seasons.seasonList;
  }

  activateTab(tabId) {
    this.activeTab = tabId;
  }

  activateSeasonTab(sNumber) {
    this.activeSeasonTab = sNumber;
  }

  isAired(airdate) {
    if (new Date(airdate) < this.today) {
      return true;
    }
    return false;
  }

  addDownloadLink(showForm: FormGroup) {
    this.series["downloadLinks"].push(showForm.value.newLink);
    this.sharedDataService.addDownloadLink(this.series["seriesId"], showForm.value.newLink);
  }

  deleteShow() {
    this.sharedDataService.deleteShow(this.series["seriesId"]);
  }

  openDownloadLink(season, episode) {
    var url = this.sharedDataService.setTorrentLink(this.series.name, season, episode);
    window.open(url, '_blank').focus();
  }

}
