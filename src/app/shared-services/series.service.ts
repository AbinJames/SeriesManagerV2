import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, timer } from 'rxjs';
import { tap, retryWhen, delayWhen } from 'rxjs/operators';
import { formatDate } from '@angular/common';
import { BaseService } from './base.service';
@Injectable({
  providedIn: 'root'
})

export class SeriesService {

  constructor(private httpClient: HttpClient, private baseService: BaseService) { }

  getShowDetails(apiId: any): Observable<any[]> {
    return this.httpClient.get<any>(`${'http://api.tvmaze.com/shows'}/${apiId}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  getShowOnDate(date: any): Observable<any[]> {
    return this.httpClient.get<any>(`${'http://api.tvmaze.com/schedule?date='}${formatDate(date, 'yyyy-MM-dd', 'en')}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  getShowOnSearch(searchText: any): Observable<any[]> {
    return this.httpClient.get<any>(`${'http://api.tvmaze.com/search/shows?q='}${searchText}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  addNewSeries(data: any): Observable<any[]> {
    console.log(data);
    return this.baseService.addData('AddSeries', data);
  }

  getEpisodeDetails(link: any): Observable<any[]> {
    return this.httpClient.get<any>(link).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  getEpisodes(apiId: any): Observable<any[]> {
    return this.httpClient.get<any>(`${'http://api.tvmaze.com/seasons'}/${apiId}/episodes`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  getSeasons(apiId: any): Observable<any[]> {
    return this.httpClient.get<any>(`${'http://api.tvmaze.com/shows'}/${apiId}/seasons`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }

  getSeries(): Observable<any[]> {
    //returns list of series from api
    return this.baseService.getData('GetSeries');
  }

  deleteSeries(seriesId: any): Observable<any[]> {
    //returns list of series from api
    return this.baseService.deleteData(`${'DeleteSeries'}/${seriesId}`);
  }

  // deleteSeries(seriesId:any): Observable<any[]> {
  //   //returns list of expense details from api
  //   return this.baseService.getData(this.baseUrl + `${'DeleteSeries'}/${seriesId}`);
  //   // return this.http.get<SeriesFull>(`${'http://api.tvmaze.com/singlesearch/shows'}/?q=${name}`);
  //   //return this.http.get<Episode[]>('http://api.tvmaze.com/shows/'+id+'/episodes');
  // }

  getWikis(searchString: any): Observable<any[]> {
    var options = {
      headers: this.baseService.getCommonHeaders()
    };
    return this.httpClient.get<any>(`${'https://en.wikipedia.org/w/api.php?action=opensearch&format=json&origin=*&search='}${searchString}`).pipe(
      retryWhen(errors =>
        errors.pipe(
          //log error message
          tap(val => console.log(val["message"])),
          //restart in 5 seconds
          delayWhen(val => timer(1000))
        )
      ));
  }
}
