import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LoginService } from '../shared-services/login.service';
import { SharedDataService } from '../shared-services/shared-data.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input('loginSuccessful') loginSuccessful = false;

  tabList: any[] = [];
  activeLink: any = "";
  options: any = null;
  data: any[] = [];
  csvRefreshed: boolean = false;
  isEndedInList: boolean = false;
  leftCounter: any = 0;
  rightCounter: any = 0;
  tabLimit: any = 7;
  newShowsCount: any = 0;

  constructor(public loginService: LoginService, public sharedDataService: SharedDataService, public router: Router, private toastr: ToastrService) { }

  ngOnInit() {
    var series = this.sharedDataService.getNewShows();
    this.sharedDataService.viewPageClicked
      .subscribe(
        (series: any) => {
          var tab = {};
          tab["routerLink"] = 'showdetails/' + series["seriesId"].toString();
          var index = -1;
          index = this.tabList.findIndex(obj => obj.routerLink == tab["routerLink"]);
          if (index != -1) {
            if (index + 1 > this.rightCounter) {
              this.rightCounter = index + 1;
              this.leftCounter = this.rightCounter - this.tabLimit;
            }
            this.router.navigate([this.tabList[index]["routerLink"]]);
            this.changePageData(this.tabList[index]);
          }
          else if (this.tabList.length < 100) {
            tab["tabName"] = series["seriesName"];
            tab["closeAble"] = true;
            tab["series"] = series;
            this.tabList.push(tab);
            this.rightCounter = this.tabList.length;
            if (this.rightCounter <= this.tabLimit) {
              this.leftCounter = 0;
            }
            else {
              this.leftCounter = this.rightCounter - this.tabLimit
            }
            this.router.navigate([tab["routerLink"]])
            this.changePageData(tab);
          }
          else {
            this.toastr.warning("Maximum tab limit");
          }

        }
      );
    this.sharedDataService.seriesEnded
      .subscribe(
        (isEndedInList: any) => {
          this.isEndedInList = isEndedInList;
          if (isEndedInList) {
            this.tabLimit = 6;
          }
          else {
            this.tabLimit = 7;
          }
        }
      );
    this.sharedDataService.csvRefreshed
      .subscribe(
        (csvRefreshed: any) => {
          this.csvRefreshed = csvRefreshed;
        }
      );
    this.sharedDataService.initialLoadComplete
      .subscribe(
        (csvRefreshed: any) => {
          this.router.navigate(['allseries'])
          this.setActiveLink('allseries');
        }
      );
      this.sharedDataService.newSeriesLoadComplete
      .subscribe(
        (newShowsCount: any) => {
          this.newShowsCount = newShowsCount;
        }
      );
    this.sharedDataService.closeClicked
      .subscribe(
        (apiId: any) => {
          var index = this.tabList.findIndex(obj => obj.series != null && obj.series["seriesId"] == apiId);
          var isMove = this.activeLink == this.tabList[index].routerLink;
          this.tabList.splice(index, 1);
          if (this.tabList.length == 0) {
            this.router.navigate(['newtoday'])
            this.setActiveLink('newtoday');
          }
          else {
            if (isMove) {
              if (this.rightCounter > this.tabList.length) {
                this.rightCounter--;
                if (this.rightCounter == this.tabList.length && this.rightCounter > this.tabLimit) {
                  this.leftCounter--;
                }
              }
              if (index >= this.tabList.length) {
                this.router.navigate([this.tabList[index - 1]["routerLink"]]);
                this.changePageData(this.tabList[index - 1]);
              }
              else {
                this.router.navigate([this.tabList[index]["routerLink"]]);
                this.changePageData(this.tabList[index]);
              }
            }
            else {
              if (this.rightCounter > this.tabList.length) {
                this.rightCounter--;
                if (this.rightCounter == this.tabList.length && this.rightCounter > this.tabLimit) {
                  this.leftCounter--;
                }
              }
            }
          }
        }
      );
  }

  setActiveLink(tabLink) {
    this.activeLink = tabLink;
  }

  changePageData(tab) {
    if (tab.series != null) {
      this.sharedDataService.changeDetailsPage(tab.series["seriesId"]);
    }
    this.activeLink = tab.routerLink;
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
      keys: ['seriesId', 'apiId', 'seriesName', 'link']
    };
    this.data = this.sharedDataService.seriesList;
    this.csvRefreshed = true;
  }

  onLogoutClick() {
    this.loginService.logout();
  }

  nameSizeLimit(tab) {
    if (tab.closeAble) {
      var name = tab.tabName.substr(0, 9);
      if (tab.tabName.length <= 9) {
        return name;
      }
      else {
        return name + '...';
      }
    }
    return tab.tabName;
  }

  closePage(tab) {
    if (tab.closeAble) {
      this.sharedDataService.closeShow(tab["series"]["seriesId"]);
    }
  }

  tabCounter() {
    var tabs = []
    for (let i = this.leftCounter; i < this.rightCounter; i++) {
      tabs.push(i);
    }
    return tabs;
  }

  moveRight() {
    if (this.rightCounter != this.tabList.length) {
      this.rightCounter++;
      this.leftCounter++;
    }
  }

  moveLeft() {
    if (this.leftCounter != 0) {
      this.rightCounter--;
      this.leftCounter--;
    }
  }
}
