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

  getWikis(searchString: any): Observable<any[]> {
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
