import { Logger } from './../shared/logger.service';
import { cloneDeep } from 'lodash';
import { Http, Headers } from '@angular/http';
import { AuthenticationService } from './../auth/authentication.service';
import { IterationModel } from './../models/iteration.model';
import { Injectable } from '@angular/core';

import { MockHttp } from './../shared/mock-http';
import Globals = require('./../shared/globals');

@Injectable()
export class IterationService {
  public iterations: IterationModel[] = [];
  private headers = new Headers({'Content-Type': 'application/json'});

  constructor(private http: Http, private auth: AuthenticationService, private logger: Logger) {
      if (this.auth.getToken() != null) {
        this.headers.set('Authorization', 'Bearer ' + this.auth.getToken());
      }
      if (Globals.inTestMode) {
        logger.log('Iteration service running in ' + process.env.ENV + ' mode.');
        this.http = new MockHttp(logger);
      } else {
        logger.log('Iteration service running in production mode.');
      }
  }

  /**
   * getIteration - We call this service method to fetch
   * @param iterationUrl - The url to get all the iteration
   * @return Promise of IterationModel[] - Array of iterations
   */
  getIterations(iterationUrl: string = ''): Promise<IterationModel[]> {
    if (this.checkValidIterationUrl(iterationUrl)) {
      return this.http
        .get(iterationUrl, { headers: this.headers })
        .toPromise()
        .then (response => {
          if (/^[5, 4][0-9]/.test(response.status.toString())) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel[];
        })
        .then((data) => {
          this.iterations = data;
          return this.iterations;
        })
        .catch ((error: Error | any) => {
          if (error.status === 401) {
            this.auth.logout(true);
          } else {
            console.log('Fetch iteration API returned some error - ', error.message);
            return Promise.reject<IterationModel[]>([] as IterationModel[]);
          }
        })
    } else {
      console.log('URL not matched');
      return Promise.reject<IterationModel[]>([] as IterationModel[]);
    }
  }

  /**
   * Create new iteration
   * @param iterationUrl - POST url
   * @param iteration - data to create a new iteration
   * @return new item
   */
  createIteration(
    iterationUrl: string = '',
    iteration: IterationModel
  ): Promise<IterationModel> {
    if (this.checkValidIterationUrl(iterationUrl)) {
      return this.http
        .post(
          iterationUrl,
          {data: iteration},
          { headers: this.headers }
        )
        .toPromise()
        .then (response => {
          if (/^[5, 4][0-9]/.test(response.status.toString())) {
            throw new Error('API error occured');
          }
          return response.json().data as IterationModel;
        })
        .then (newData => {
          // Add the newly added iteration on the top of the list
          this.iterations.splice(0, 0, newData);
          return newData;
        })
        .catch ((error: Error | any) => {
          if (error.status === 401) {
            this.auth.logout(true);
          } else {
            console.log('Post iteration API returned some error - ', error.message);
            return Promise.reject<IterationModel>({} as IterationModel);
          }
        })
    } else {
      console.log('URL not matched');
      return Promise.reject<IterationModel>( {} as IterationModel );
    }
  }

  /**
   * Update an existing iteration
   * @param iteration - Updated iteration
   * @return updated iteration's reference from the list
   */
  updateIteration(iteration: IterationModel): Promise<IterationModel> {
    return this.http
      .patch(iteration.links.self, { data: iteration }, { headers: this.headers })
      .toPromise()
      .then (response => {
        if (/^[5, 4][0-9]/.test(response.status.toString())) {
          throw new Error('API error occured');
        }
        return response.json().data as IterationModel;
      })
      .then (updatedData => {
        // Update existing iteration data
        let index = this.iterations.findIndex(item => item.id === updatedData.id);
        if (index > -1) {
          this.iterations[index] = cloneDeep(updatedData);
          return this.iterations[index];
        } else {
          this.iterations.splice(0, 0, updatedData);
          return this.iterations[0];
        }
      })
      .catch ((error: Error | any) => {
        if (error.status === 401) {
          this.auth.logout(true);
        } else {
          console.log('Patch iteration API returned some error - ', error.message);
          return Promise.reject<IterationModel>({} as IterationModel);
        }
      })
  }

  /**
   * checkValidIterationUrl checks if the API url for
   * iterations is valid or not
   * sample url -
   * http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations
   *
   * @param URL
   * @return Boolean
   */
  checkValidIterationUrl(url: string): Boolean {
    let urlArr: string[] = url.split('/');
    let uuidRegExpPattern = new RegExp('[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}');
    return (
      urlArr[urlArr.length - 1] === 'iterations' &&
      uuidRegExpPattern.test(urlArr[urlArr.length - 2]) &&
      urlArr[urlArr.length - 3] === 'spaces'
    );
  }

}
