import { Component, OnInit, Input } from '@angular/core';
import { LoginService } from '../shared-services/login.service';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input('loginSuccessful') loginSuccessful = false;

  seriesPageList: any[] = [];
  activeLink: any = "";
  options: any = null;
  data: any[] = [];
  csvRefreshed : boolean = false;

  constructor(public loginService: LoginService, public sharedDataService: SharedDataService) { }

  ngOnInit() {
    this.sharedDataService.viewPageClicked
      .subscribe(
        (series: any) => {
          series["routerLink"] = 'showdetails/' + series["seriesId"].toString();
          this.seriesPageList.push(series);
        }
      );
      this.sharedDataService.csvRefreshed
      .subscribe(
        (csvRefreshed: any) => {
          this.csvRefreshed = csvRefreshed;
        }
      );
  }

  setActiveLink(tabName) {
    this.activeLink = tabName;
  }

  changePageData(seriesId, tabName) {
    this.sharedDataService.changeDetailsPage(seriesId);
    this.activeLink = tabName;
  }

  refreshCSV() {
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
      keys: ['seriesId','apiId','seriesName','link']
    };
    this.data = this.sharedDataService.seriesList;
    this.csvRefreshed = true;
  }

  onLogoutClick() {
    this.loginService.logout();
  }
}
