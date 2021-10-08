import { Component, OnInit } from '@angular/core';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  constructor(public sharedDataService: SharedDataService) { }

  ngOnInit() {
    
  }

}
