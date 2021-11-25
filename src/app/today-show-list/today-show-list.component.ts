import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { formatDate } from "@angular/common";
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
  today = new Date();
  showTodayDate = null;
  showDate = null;
  newDate = null;
  dateForm: FormGroup;

  constructor(private sharedDataService: SharedDataService, private formBuilder: FormBuilder) { }

  ngOnInit(): void {
    this.today.setHours(0, 0, 0, 0);
    this.showTodayDate = formatDate(this.today, 'yyyy-MM-dd', 'en');
    this.sharedDataService.changeDate(this.today);
    this.initialiseData();
    this.dateForm = this.formBuilder.group({
      newDate: this.showTodayDate
    });
  }

  initialiseData(){
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

  changeDate(dateForm: FormGroup) {
    this.newDate = new Date(dateForm.value.newDate);
    this.showDate = formatDate(this.newDate, 'yyyy-MM-dd', 'en');
    this.sharedDataService.changeDate(this.newDate);
    this.initialiseData();
  }

}
