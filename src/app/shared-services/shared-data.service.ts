import { EventEmitter, Injectable, Output } from "@angular/core";
import { SeriesService } from "./series.service";
import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class SharedDataService {
    
    seriesList: any[] = [];
    seriesDetails: any[] = [];
    seriesDetailsToday: any[] = [];
    seriesImageList: any[] = [];
    newShows: any[] = [];
    noImage: any = "assets/no_image.png";
    yesterday = new Date();
    today = new Date();
    loadedDataCount: number = 0;
    totalDataCount:number = 1;

    constructor(private seriesService: SeriesService, private http: HttpClient) { }

    getDataRecordsArrayFromCSVFile(csvRecordsArray: any, headerLength: any) {
        let csvArr = [];
    
        for (let i = 1; i < csvRecordsArray.length; i++) {
          let curruntRecord = (<string>csvRecordsArray[i]).split(',');
          if (curruntRecord.length == headerLength) {
            let csvRecord: any = {
              seriesId: 0,
              apiId: 0,
              seriesName: null,
            };
            csvRecord.seriesId = curruntRecord[0].trim();
            csvRecord.apiId = curruntRecord[1].trim();
            csvRecord.seriesName = curruntRecord[2].trim();
            csvArr.push(csvRecord);
          }
        }
        return csvArr;
      }
    
      getHeaderArray(csvRecordsArr: any) {
        let headers = (<string>csvRecordsArr[0]).split(',');
        let headerArray = [];
        for (let j = 0; j < headers.length; j++) {
          headerArray.push(headers[j]);
        }
        return headerArray;
      }

    initializeSeriesList() {
        this.yesterday.setDate(this.today.getDate() - 1);
        console.log(this.yesterday)
        this.seriesDetails = [];
        this.http.get('assets/series.csv', {responseType: 'text'})
        .subscribe(data => {
            let csvRecordsArray = (<string>data).split(/\r\n|\n/);
            let headersRow = this.getHeaderArray(csvRecordsArray);
            this.seriesList = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, headersRow.length);
            this.totalDataCount = this.seriesList.length;
            for (let index = 0; index < this.seriesList.length; index++) {

                this.seriesService.getShowDetails(this.seriesList[index].apiId).subscribe(response => {
                    var show = response;

                    this.setShowImage(response["image"], index);

                    show = this.setShowNextEpisode(show, response["_links"]["nextepisode"]);

                    show = this.setShowPreviousEpisode(show, response["_links"]["previousepisode"]);

                    //     this.seasonToggleClicked[series["id"]] = false;
                    //     this.wikiToggleClicked[series["id"]] = false;
                    this.seriesDetails.push(show);
                });
            }
        });
    }

    showSort() {
        var seriesWithNextDate = this.seriesDetails.filter(item => item.nextEpisodeAirdate != null);
        var seriesWithoutNextDate = this.seriesDetails.filter(item => item.nextEpisodeAirdate == null);
        seriesWithNextDate = seriesWithNextDate.sort((a, b) => (a["nextEpisodeAirdate"] > b["nextEpisodeAirdate"]) ? 1 : -1)
        this.seriesDetails = [];
        this.seriesDetails = seriesWithNextDate;
    }

    getShowList(): any {
        return this.seriesDetails;
    }

    getTodayShowList(): any {
        return this.seriesDetailsToday;
    }

    getNewShows(): any {
        this.seriesService.getShowOnDate(this.yesterday).subscribe(shows => {
            for (let index = 0; index < shows.length; index++) {
                if ( shows[index]["season"] == 1 && shows[index]["number"] == 1) {
                    this.seriesService.getSeasons(shows[index]["show"]["id"]).subscribe(seasons => {
                        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                            if (seasons[seasonIndex]["number"] == shows[index]["season"]) {
                                this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                                    if (episodes[0]["airdate"] == formatDate(this.yesterday, 'yyyy-MM-dd', 'en')) {
                                        episodes[0]["seriesName"] = shows[index]["show"]["name"];
                                        episodes[0]["seriesId"] = shows[index]["show"]["id"];
                                        episodes[0]["image"] = shows[index]["show"]["image"];
                                        episodes[0]["summary"] = shows[index]["show"]["summary"];
                                        this.newShows.push(episodes[0]);
                                    }
                                });
                            }
                        }
                    });
                }
            }
        });
        return this.newShows;
    }

    getShowImageList(): any {
        return this.seriesImageList;
    }

    setShowImage(image, index) {
        if (image == null) {
            this.seriesImageList[this.seriesList[index].apiId] = this.noImage;
        }
        else {
            this.seriesImageList[this.seriesList[index].apiId] = image["medium"];
        }
    }

    setShowPreviousEpisode(show, previousEpisode): any {
        show["previousEpisodeSeason"] = null;
        show["previousEpisodeNumber"] = null;
        show["previousEpisodeName"] = null;
        show["previousEpisodeAirdate"] = "-";

        if (previousEpisode != null) {
            this.seriesService.getEpisodeDetails(previousEpisode["href"]).subscribe(prevEpisode => {
                if (prevEpisode["airdate"] == formatDate(this.yesterday, 'yyyy-MM-dd', 'en')) {
                    show["onDownloadToday"] = true;
                    this.getCurrentSeason(show["id"], prevEpisode["season"], show);
                }
                show["previousEpisodeSeason"] = prevEpisode["season"];
                show["previousEpisodeNumber"] = prevEpisode["number"];
                show["previousEpisodeName"] = prevEpisode["name"];
                show["previousEpisodeAirdate"] = prevEpisode["airdate"];
            });
        }

        return show;
    }

    getCurrentSeason(showId, previousSeason, show) {
        this.seriesService.getSeasons(showId).subscribe(seasons => {
            for (let index = 0; index < seasons.length; index++) {
                if (seasons[index]["number"] == previousSeason) {
                    this.getCurrentEpisode(seasons[index]["id"], seasons[index]["number"], show);
                }
            }
        });
    }

    getCurrentEpisode(seasonId, seasonNumber, show) {
        this.seriesService.getEpisodes(seasonId).subscribe(episodes => {
            for (let index = 0; index < episodes.length; index++) {
                if (episodes[index]["airdate"] == formatDate(this.yesterday, 'yyyy-MM-dd', 'en')) {
                    episodes[index]["seriesName"] = show["name"];
                    episodes[index]["seriesId"] = show["id"];
                    episodes[index]["torrentLink"] = this.setTorrentLink(show["name"], seasonNumber, episodes[index]["number"]);
                    this.seriesDetailsToday.push(episodes[index]);
                }
            }
        });
    }

    setTorrentLink(name, season, episode) {
        name = name.replace("'", "");
        name = name.replace("-", "");
        var searchString = name + " s" + ((Math.floor(season / 10) > 0) ? String(season) : "0" + String(season)) + "e" + ((Math.floor(episode / 10) > 0) ? String(episode) : "0" + String(episode));
        return `${'https://1337x.to/search/'}/${searchString}/${'/1/'}`;
    }

    setShowNextEpisode(show, nextEpisode): any {
        show["nextEpisodeSeason"] = null;
        show["nextEpisodeNumber"] = null;
        show["nextEpisodeName"] = null;
        show["nextEpisodeAirdate"] = null;
        show["onDownloadToday"] = false;
        if (nextEpisode != null) {
            this.seriesService.getEpisodeDetails(nextEpisode["href"]).subscribe(episode => {
                show["nextEpisodeSeason"] = episode["season"];
                show["nextEpisodeNumber"] = episode["number"];
                show["nextEpisodeName"] = episode["name"];
                show["nextEpisodeAirdate"] = episode["airdate"];
                show["next"] = "S" + ((Math.floor(episode["season"] / 10) > 0) ? String(episode["season"]) : "0" + String(episode["season"])) + " E" + ((Math.floor(episode["number"] / 10) > 0) ? String(episode["number"]) : "0" + String(episode["number"]));
                this.loadedDataCount = this.loadedDataCount + 1;
            });
        }
        else {
            this.loadedDataCount = this.loadedDataCount + 1;
        }

        return show;
    }

}