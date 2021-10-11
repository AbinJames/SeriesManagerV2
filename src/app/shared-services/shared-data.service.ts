import { EventEmitter, Injectable, Output } from "@angular/core";
import { SeriesService } from "./series.service";
import { formatDate } from "@angular/common";
import { HttpClient } from "@angular/common/http";

@Injectable({
    providedIn: 'root'
})

export class SharedDataService {
    @Output() viewPageClicked = new EventEmitter<any>();
    @Output() changePageClicked = new EventEmitter<any>();
    @Output() csvRefreshed = new EventEmitter<any>();
    @Output() seriesEnded = new EventEmitter<any>();
    @Output() initialLoadComplete = new EventEmitter<any>();
    @Output() closeClicked = new EventEmitter<any>();
    @Output() newShowUnselected = new EventEmitter<any>();

    seriesList: any[] = [];
    seriesDetails: any[] = [];
    seriesDetailsToday: any[] = [];
    seriesImageList: any[] = [];
    newShows: any[] = [];
    searchedShows: any[] = [];
    noImage: any = "assets/no_image.png";
    yesterday = new Date();
    today = new Date();
    loadedDataCount: number = 0;
    totalDataCount: number = 1;
    headersRow: any[] = [];
    seriesWikiList: any[] = [];
    seriesSeasonsList: any[] = [];
    distinctDates: any[] = [];
    initialLoadCompleted: boolean = false;

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
                    link: null,
                };
                csvRecord.seriesId = parseInt(curruntRecord[0].trim());
                csvRecord.apiId = parseInt(curruntRecord[1].trim());
                csvRecord.seriesName = curruntRecord[2].trim().replace(/"/gi, '');
                csvRecord.link = curruntRecord[3].trim().replace(/"/gi, '');
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
        this.seriesDetails = [];
        this.http.get('assets/series.csv', { responseType: 'text' })
            .subscribe(data => {
                let csvRecordsArray = (<string>data).split(/\r\n|\n/);
                this.headersRow = this.getHeaderArray(csvRecordsArray);
                this.seriesList = this.getDataRecordsArrayFromCSVFile(csvRecordsArray, this.headersRow.length);
                this.totalDataCount = this.seriesList.length;
                for (let index = 0; index < this.seriesList.length; index++) {
                    this.addSeriesDetails(index);
                }
            });
        this.newShows = this.getNewShows();
    }

    addSeriesDetails(index) {
        this.seriesService.getShowDetails(this.seriesList[index].apiId).subscribe(response => {
            var show = response;
            this.setShowImage(response["image"], index);
            show = this.setShowNextEpisode(show, response["_links"]["nextepisode"]);
            show = this.setShowPreviousEpisode(show, response["_links"]["previousepisode"]);
            show["seriesId"] = show["id"];
            show["seriesName"] = show["name"];
            if (this.seriesList[index]["link"] == null || this.seriesList[index]["link"] == "") {
                show["downloadLinks"] = [];
            }
            else {
                show["downloadLinks"] = this.seriesList[index]["link"].split(';');
            }
            if (show["status"] == "Ended") {
                this.seriesEnded.emit(true);
            }
            this.seriesDetails.push(show);
        });
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
                if (shows[index]["season"] == 1 && shows[index]["number"] == 1) {
                    this.seriesService.getSeasons(shows[index]["show"]["id"]).subscribe(seasons => {
                        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                            if (seasons[seasonIndex]["number"] == shows[index]["season"]) {
                                this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                                    if (episodes[0]["airdate"] == formatDate(this.yesterday, 'yyyy-MM-dd', 'en')) {
                                        episodes[0]["seriesName"] = shows[index]["show"]["name"];
                                        episodes[0]["seriesId"] = shows[index]["show"]["id"];
                                        episodes[0]["image"] = shows[index]["show"]["image"];
                                        episodes[0]["summary"] = shows[index]["show"]["summary"];
                                        episodes[0]["isAdded"] = false;
                                        var isAdded = -1;
                                        isAdded = this.seriesList.findIndex((obj => parseInt(obj.apiId) == shows[index]["show"]["id"]));
                                        if (isAdded == -1) {
                                            isAdded = -1;
                                            isAdded = this.newShows.findIndex((obj => parseInt(obj["seriesId"]) == shows[index]["show"]["id"]));
                                            if (isAdded == -1) {
                                                this.newShows.push(episodes[0]);
                                            }
                                        }
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

    searchNewShows(searchText): any {
        this.searchedShows = [];
        this.seriesService.getShowOnSearch(searchText).subscribe(shows => {
            for (let index = 0; index < shows.length; index++) {
                shows[index]["seriesName"] = shows[index]["show"]["name"];
                shows[index]["seriesId"] = shows[index]["show"]["id"];
                shows[index]["isAdded"] = false;
                var isAdded = -1;
                isAdded = this.seriesList.findIndex((obj => parseInt(obj.apiId) == shows[index]["show"]["id"]));
                if (isAdded == -1) {
                    this.searchedShows.push(shows[index]);
                }
            }
        });
        return this.searchedShows;
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
                show["previous"] = "S" + ((Math.floor(prevEpisode["season"] / 10) > 0) ? String(prevEpisode["season"]) : "0" + String(prevEpisode["season"])) + " E" + ((Math.floor(prevEpisode["number"] / 10) > 0) ? String(prevEpisode["number"]) : "0" + String(prevEpisode["number"]));

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
                var dateIndex = -1;
                dateIndex = this.distinctDates.findIndex(obj => obj == show["nextEpisodeAirdate"]);
                if (dateIndex == -1) {
                    this.distinctDates.push(show["nextEpisodeAirdate"]);
                    this.distinctDates.sort(function (a, b) {
                        return +new Date(a) - +new Date(b);
                    });
                }
                show["next"] = "S" + ((Math.floor(episode["season"] / 10) > 0) ? String(episode["season"]) : "0" + String(episode["season"])) + " E" + ((Math.floor(episode["number"] / 10) > 0) ? String(episode["number"]) : "0" + String(episode["number"]));
                this.loadedDataCount = this.loadedDataCount + 1;
                if (this.loadedDataCount == this.totalDataCount && !this.initialLoadCompleted) {
                    this.initialLoadComplete.emit();
                    this.initialLoadCompleted = true;
                }
            });
        }
        else {
            this.loadedDataCount = this.loadedDataCount + 1;
        }

        if (this.loadedDataCount == this.totalDataCount && !this.initialLoadCompleted) {
            this.initialLoadComplete.emit();
            this.initialLoadCompleted = true;
        }

        return show;
    }

    addSeries(series) {
        this.totalDataCount = this.totalDataCount + 1;
        let newRecord = {
            seriesId: this.totalDataCount,
            apiId: series["seriesId"],
            seriesName: series["seriesName"],
            link: ""
        };
        this.seriesList.push(newRecord);
        this.addSeriesDetails(this.totalDataCount - 1);
        this.csvRefreshed.emit(false);
    }

    viewDetailsPage(series) {
        this.viewPageClicked.emit(series);
    }

    changeDetailsPage(seriesId) {
        this.changePageClicked.emit(seriesId);
    }

    getSeries(seriesId) {
        var series = this.seriesDetails.find(obj => obj.id == seriesId);
        var index = -1;

        if (this.seriesWikiList.length != 0) {
            index = this.seriesWikiList.findIndex(obj => obj.seriesId == seriesId);
        }

        if (index == -1) {
            this.seriesService.getWikis(series["name"]).subscribe(wiki => {
                var wikiObj = {
                    seriesId: seriesId,
                    wikiList: wiki[3],
                }
                this.seriesWikiList.push(wikiObj);
                series["wiki"] = wiki[3];
            });
        }
        else {
            series["wiki"] = this.seriesWikiList[index]["wikiList"];
        }

        index = -1;
        if (this.seriesSeasonsList.length != 0) {
            index = this.seriesSeasonsList.findIndex(obj => obj.seriesId == seriesId);
        }

        if (index == -1) {
            this.seriesService.getSeasons(seriesId).subscribe(seasons => {
                var seasonObj = {
                    seriesId: seriesId,
                    seasonList: seasons,
                };

                for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                    seasons[seasonIndex]["episodes"] = null;
                    if (seasons[seasonIndex]["premiereDate"] != null) {
                        this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                            var propertyName = "season" + seasons[seasonIndex]["number"].toString() + "episodes";
                            seasonObj[propertyName] = episodes;
                        });
                    }
                    else {
                        var propertyName = "season" + seasons[seasonIndex]["number"].toString() + "episodes";
                        seasonObj[propertyName] = [];
                    }

                }
                this.seriesSeasonsList.push(seasonObj);
                series["seasons"] = seasonObj;
            });
        }
        else {
            series["seasons"] = this.seriesSeasonsList[index];
        }

        return series;
    }

    addDownloadLink(apiId, downloadLink) {
        var index = this.seriesList.findIndex(obj => obj.apiId == apiId);
        if (this.seriesList[index]["link"] == null || this.seriesList[index]["link"] == "") {
            this.seriesList[index]["link"] = downloadLink;
        }
        else {
            this.seriesList[index]["link"] = this.seriesList[index]["link"] + ";" + downloadLink;
        }
        this.csvRefreshed.emit(false);
    }

    closeShow(apiId) {
        this.closeClicked.emit(apiId);
    }

    deleteShow(apiId) {
        var index = -1;
        index = this.seriesList.findIndex(obj => obj.apiId == apiId)
        if (index != -1) {
            this.seriesList.splice(index, 1);
        }
        index = -1;
        index = this.seriesDetails.findIndex(obj => obj.seriesId == apiId);
        if (index != -1) {
            this.seriesDetails.splice(index, 1);
        }
        index = -1;
        index = this.seriesDetailsToday.findIndex(obj => obj.seriesId == apiId);
        if (index != -1) {
            this.seriesDetailsToday.splice(index, 1);
        }
        this.newShowUnselected.emit(apiId);
        this.closeClicked.emit(apiId);
        this.csvRefreshed.emit(false);
    }

}