import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs/internal/Observable';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class BaseService {

  constructor(private httpClient: HttpClient) { }

  baseUrl: string = 'http://localhost:8084/api/SeriesManagerServer/';

  printToConsole(arg: string) {
    console.log("Connected to Base Module : " + arg);
  }

  addData(api: String, data: any): Observable<any> {
    //Post data to API to be saved in Database
    console.log(this.baseUrl + api, data)
    return this.httpClient.post(this.baseUrl + api, data).pipe(map(response => {
      return response;
    }))
      .pipe(catchError((error: any) => {
        console.log(error)
        return this.handleError(error);
      }));
  }

  getData(api: String): Observable<any> {
    //returns list of details from api
    // return this.httpClient.get<any[]>(this.baseUrl + api);
    return this.httpClient.get(this.baseUrl + api)
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError((error: any) => {
        return this.handleError(error);
      }));
  }

  deleteData(api: string): Observable<any> {
    return this.httpClient.delete(this.baseUrl + api)
      .pipe(map(response => {
        return response;
      }))
      .pipe(catchError((error: any) => {
        return this.handleError(error);
      }));
  }

  /**function to handle error */
  public handleError(error: any) {
    let errMsg = 'Server Error';
    if (error.error && error.error.Value) {
      errMsg = error.error.Value.Message;
    } else if (error.status) {
      errMsg = `${error.status} - ${error.statusText}`;
    }

    if (error.status == 401) {
      // this.toastService.showError("Your session has timed out. Please login again.");
      // this.router.navigateByUrl('accessDenied');
    } else {
      // this.toastService.showError(errMsg);
    }
    return Observable.throw(errMsg);
  }

  getCommonHeaders() {
    return new HttpHeaders({
      "Access-Control-Allow-Origin": "http://localhost:4200/view-series",
      "Content-Type": "application/json"
    });
  }

}
