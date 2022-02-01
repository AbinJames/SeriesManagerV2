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
    @Output() newSeriesLoadComplete = new EventEmitter<any>();
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
        this.seriesDetailsToday = [];
        this.seriesDetails = [];
        this.seriesList = [];
        this.yesterday.setDate(this.today.getDate() - 1);
        this.today.setHours(0, 0, 0, 0);
        this.yesterday.setHours(0, 0, 0, 0);
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
    }

    addSeriesDetails(index) {
        this.seriesService.getShowDetails(this.seriesList[index].apiId).subscribe(response => {
            var show = response;
            this.setShowImage(response["image"], index);
            show["seriesId"] = show["id"];
            show["seriesName"] = show["name"];
            show = this.setShowPreviousEpisode(show, response["_links"]["previousepisode"], this.yesterday);
            if (show["status"] != 'Ended' || (show["status"] == 'Ended' && show["ended"] == formatDate(this.yesterday, 'yyyy-MM-dd', 'en')) || (show["status"] == 'Ended' && show["ended"] == formatDate(this.today, 'yyyy-MM-dd', 'en'))) {
                var link = null;
                if (response["_links"]["previousepisode"]) {
                    link = response["_links"]["previousepisode"]["href"];
                }
                else {
                    link = response["_links"]["nextepisode"]["href"];
                }
                this.seriesService.getEpisodeDetails(link).subscribe(prevEpisode => {
                    this.seriesService.getSeasons(show["seriesId"]).subscribe(seasons => {
                        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                            if (seasons[seasonIndex]["premiereDate"] != null && seasons[seasonIndex]["number"] >= prevEpisode["season"]) {
                                this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                                    for (let episodeIndex = 0; episodeIndex < episodes.length; episodeIndex++) {
                                        var airdate = new Date(episodes[episodeIndex]["airdate"]);
                                        if (airdate >= this.yesterday) {
                                            if (airdate > this.yesterday) {
                                                show["IsRunning"] = true;
                                            }
                                            else {
                                                show["IsRunning"] = false;
                                            }
                                            if (show[episodes[episodeIndex]["airdate"]]) {
                                                show[episodes[episodeIndex]["airdate"]].push(episodes[episodeIndex]);
                                            }
                                            else {
                                                show[episodes[episodeIndex]["airdate"]] = [];
                                                show[episodes[episodeIndex]["airdate"]].push(episodes[episodeIndex]);
                                            }

                                            var dateIndex = -1;
                                            dateIndex = this.distinctDates.findIndex(obj => obj == episodes[episodeIndex]["airdate"]);
                                            if (dateIndex == -1) {
                                                this.distinctDates.push(episodes[episodeIndex]["airdate"]);
                                                this.distinctDates.sort(function (a, b) {
                                                    return +new Date(a) - +new Date(b);
                                                });
                                            }
                                        }

                                        if (seasonIndex == seasons.length - 1 && episodeIndex == episodes.length - 1) {
                                            this.loadedDataCount = this.loadedDataCount + 1;
                                            if (this.loadedDataCount == this.totalDataCount && !this.initialLoadCompleted) {
                                                this.initialLoadComplete.emit();
                                                this.initialLoadCompleted = true;
                                            }
                                        }
                                    }
                                });
                            }
                            else {
                                if (seasonIndex == seasons.length - 1) {
                                    this.loadedDataCount = this.loadedDataCount + 1;
                                    if (this.loadedDataCount == this.totalDataCount && !this.initialLoadCompleted) {
                                        this.initialLoadComplete.emit();
                                        this.initialLoadCompleted = true;
                                    }
                                }
                            }
                        }
                    });
                });
            }
            else {
                this.loadedDataCount = this.loadedDataCount + 1;
                if (this.loadedDataCount == this.totalDataCount && !this.initialLoadCompleted) {
                    this.initialLoadComplete.emit();
                    this.initialLoadCompleted = true;
                }
            }

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
        this.seriesService.getShowOnDate(this.today).subscribe(shows => {
            for (let index = 0; index < shows.length; index++) {
                var premiereDate = new Date(shows[index]["show"]["premiered"]);
                premiereDate.setHours(0, 0, 0, 0);
                if (premiereDate == this.today && (shows[index]["show"]["language"] == 'English' || shows[index]["show"]["language"] == 'Japanese')) {
                    this.seriesService.getSeasons(shows[index]["show"]["id"]).subscribe(seasons => {
                        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                            if (seasons[seasonIndex]["number"] == shows[index]["season"]) {
                                this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                                    if (episodes[0]["airdate"] == formatDate(this.today, 'yyyy-MM-dd', 'en')) {
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
                                                this.newSeriesLoadComplete.emit(this.newShows.length);
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
        this.seriesService.getWebShowOnDate(this.today).subscribe(shows => {
            for (let index = 0; index < shows.length; index++) {
                if (shows[index]["season"] == 1 && (shows[index]["_embedded"]["show"]["language"] == 'English' || shows[index]["_embedded"]["show"]["language"] == 'Japanese')) {
                    this.seriesService.getSeasons(shows[index]["_embedded"]["show"]["id"]).subscribe(seasons => {
                        for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                            if (seasons[seasonIndex]["number"] == shows[index]["season"]) {
                                this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                                    if (episodes[0]["airdate"] == formatDate(this.today, 'yyyy-MM-dd', 'en')) {
                                        episodes[0]["seriesName"] = shows[index]["_embedded"]["show"]["name"];
                                        episodes[0]["seriesId"] = shows[index]["_embedded"]["show"]["id"];
                                        episodes[0]["image"] = shows[index]["_embedded"]["show"]["image"];
                                        episodes[0]["summary"] = shows[index]["_embedded"]["show"]["summary"];
                                        episodes[0]["isAdded"] = false;
                                        var isAdded = -1;
                                        isAdded = this.seriesList.findIndex((obj => parseInt(obj.apiId) == shows[index]["_embedded"]["show"]["id"]));
                                        if (isAdded == -1) {
                                            isAdded = -1;
                                            isAdded = this.newShows.findIndex((obj => parseInt(obj["seriesId"]) == shows[index]["_embedded"]["show"]["id"]));
                                            if (isAdded == -1) {
                                                this.newShows.push(episodes[0]);
                                                this.newSeriesLoadComplete.emit(this.newShows.length);
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

    getNewShowsList(): any {
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

    setShowPreviousEpisode(show, previousEpisode, previousDate): any {
        show["previousEpisodeSeason"] = null;
        show["previousEpisodeNumber"] = null;
        show["previousEpisodeName"] = null;
        show["previousEpisodeAirdate"] = "-";

        if (previousEpisode != null) {
            this.seriesService.getEpisodeDetails(previousEpisode["href"]).subscribe(prevEpisode => {
                if (prevEpisode["airdate"] == formatDate(previousDate, 'yyyy-MM-dd', 'en')) {
                    show["onDownloadToday"] = true;
                    this.getCurrentSeason(show["id"], prevEpisode["season"], show, previousDate);
                }
                show["previousEpisodeSeason"] = prevEpisode["season"];
                show["previousEpisodeNumber"] = prevEpisode["number"];
                show["previousEpisodeName"] = prevEpisode["name"];
                show["previousEpisodeAirdate"] = prevEpisode["airdate"];
                show["previous"] = this.getShorthandSE(prevEpisode["season"], prevEpisode["number"]);
            });
        }

        return show;
    }

    getCurrentSeason(showId, previousSeason, show, previousDate) {
        this.seriesService.getSeasons(showId).subscribe(seasons => {
            for (let index = 0; index < seasons.length; index++) {
                if (seasons[index]["number"] == previousSeason) {
                    this.getCurrentEpisode(seasons[index]["id"], seasons[index]["number"], show, previousDate);
                }
            }
        });
    }

    getCurrentEpisode(seasonId, seasonNumber, show, previousDate) {
        this.seriesService.getEpisodes(seasonId).subscribe(episodes => {
            for (let index = 0; index < episodes.length; index++) {
                if (episodes[index]["airdate"] == formatDate(previousDate, 'yyyy-MM-dd', 'en')) {
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
        var searchString = name + " " + this.getShorthandSE(season, episode);
        return `${'https://1337x.to/search/'}/${searchString}/${'/1/'}`;
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
        index = -1;
        index = this.seriesDetails.findIndex(obj => obj["status"] == 'Ended');
        if (index == -1) {
            this.seriesEnded.emit(false);
        }
        this.loadedDataCount = this.loadedDataCount - 1;
        this.totalDataCount = this.totalDataCount - 1;

        this.newShowUnselected.emit(apiId);
        this.closeClicked.emit(apiId);
        this.csvRefreshed.emit(false);
    }

    getShorthandSE(season, episode) {

        if (episode == null) {
            return "S" + ((Math.floor(season / 10) > 0) ? String(season) : "0" + String(season)) + " Special";
        }
        return "S" + ((Math.floor(season / 10) > 0) ? String(season) : "0" + String(season)) + "E" + ((Math.floor(episode / 10) > 0) ? String(episode) : "0" + String(episode));
    }

    changeDate(newDate) {
        this.seriesDetailsToday = []
        newDate.setDate(newDate.getDate() - 1);
        newDate.setHours(0, 0, 0, 0);
        for (let index = 0; index < this.seriesList.length; index++) {
            this.seriesService.getSeasons(this.seriesList[index].apiId).subscribe(seasons => {

                for (let seasonIndex = 0; seasonIndex < seasons.length; seasonIndex++) {
                    seasons[seasonIndex]["episodes"] = null;
                    if (seasons[seasonIndex]["premiereDate"] != null) {
                        this.seriesService.getEpisodes(seasons[seasonIndex]["id"]).subscribe(episodes => {
                            for (let episodeIndex = 0; episodeIndex < episodes.length; episodeIndex++) {
                                if (episodes[episodeIndex]["airdate"] == formatDate(newDate, 'yyyy-MM-dd', 'en')) {
                                    episodes[episodeIndex]["seriesName"] = this.seriesList[index].seriesName;
                                    episodes[episodeIndex]["seriesId"] = this.seriesList[index].apiId;
                                    episodes[episodeIndex]["torrentLink"] = this.setTorrentLink(this.seriesList[index].seriesName, episodes[episodeIndex]["season"], episodes[episodeIndex]["number"]);
                                    if (this.seriesList[index]["link"] == null || this.seriesList[index]["link"] == "") {
                                        episodes[episodeIndex]["downloadLinks"] = [];
                                    }
                                    else {
                                        episodes[episodeIndex]["downloadLinks"] = this.seriesList[index]["link"].split(';');
                                    }
                                    this.seriesDetailsToday.push(episodes[episodeIndex]);
                                }
                            }
                        });
                    }

                }
            });
        }
    }

}