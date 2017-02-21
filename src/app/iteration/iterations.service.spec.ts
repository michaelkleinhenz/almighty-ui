import { SpaceService } from './../shared/mock-spaces.service';
import { Logger } from './../shared/logger.service';
import { cloneDeep } from 'lodash';
import { IterationModel } from './../models/iteration.model';
import { AuthenticationService } from './../auth/authentication.service';
import {
  BaseRequestOptions,
  Http,
  Response,
  ResponseOptions
} from '@angular/http';
import {
  async,
  inject,
  TestBed
} from '@angular/core/testing';
import { MockBackend } from '@angular/http/testing';
import { IterationService } from './iteration.service';

describe ('Iteration service - ', () => {
  let apiService: IterationService;
  let mockService: MockBackend;

  let fakeAuthService: any;
  let fakeSpaceService: any;

  beforeEach(() => {
    fakeAuthService = {
      getToken: function () {
        return '';
      },
      isLoggedIn: function() {
        return true;
      }
    };

    fakeSpaceService = {
      getCurrentSpace: function() {
        return Promise.resolve({
          iterationsUrl: 'http://localhost:8080/api/spaces/1f669678-ca2c-4cbb-b46d-5b70a98dde3c/iterations',
          name: 'Project 1',
          spaceBaseUrl: 'http://localhost:8080/api/'
        });
      }
    };

    TestBed.configureTestingModule({
      providers: [
        Logger,
        BaseRequestOptions,
        MockBackend,
        {
          provide: Http,
          useFactory: (backend: MockBackend,
                       options: BaseRequestOptions) => new Http(backend, options),
          deps: [MockBackend, BaseRequestOptions]
        },
        {
          provide: AuthenticationService,
          useValue: fakeAuthService
        },
        {
          provide: SpaceService,
          useValue: fakeSpaceService
        },
        IterationService
      ]
    });
  });

  beforeEach(inject(
    [IterationService, MockBackend],
    (service: IterationService, mock: MockBackend) => {
      apiService = service;
      mockService = mock;
    }
  ));

  let resp: IterationModel[] = [{
      attributes: {
        endAt: '2016-11-29T23:18:14Z',
        name: 'Sprint #24',
        startAt: '2016-11-29T23:18:14Z',
        state: 'start'
      },
      id: 'd8535583-dfbd-4b62-be8d-44a7d4fa7048',
      links: {
        self: 'http://localhost:8080/api/iterations/d8535583-dfbd-4b62-be8d-44a7d4fa7048'
      },
      relationships: {
        space: {
          data: {
            id: 'd7d98b45-415a-4cfc-add2-ec7b7aee7dd5',
            type: 'spaces'
          },
          links: {
            self: 'http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5'
          }
        }
      },
      type: 'iterations'
  }];
  let response = {data: resp, links: {}};
  let checkResp = cloneDeep(resp);

  it('Get iterations', async(() => {
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });
    apiService.getIterations()
      .then (data => {
        expect(data).toEqual(checkResp);
       });

    // For an invalid URL
    apiService.getIterations()
      .catch ((data) => {
        expect(data).toEqual([]);
      });

    // Check if data from response is assigned to the private variable
    apiService.getIterations()
      .then (data => {
        expect(apiService.iterations).toEqual(checkResp);
       });

    apiService.getIterations()
      .catch ((data) => {
        expect(apiService.iterations).toEqual([]);
      });
  }));

  // Test if the API returns error
  it('Get iteration with error', async(() => {
    let url1 = 'http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations';

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: {},
          status: 404
        })
      ));
    });

    // Error response
    apiService.getIterations()
      .catch (data => {
        expect(data).toEqual([]);
      })
      .then (() => {
        expect(apiService.iterations.length).toEqual(0);
      });
  }));

  // Test if everything is okay
  it('Create iteration', async(() => {
    let requestParams = resp[0];
    let responseData = cloneDeep(requestParams);
    let response = {data: responseData};

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: JSON.stringify(response),
          status: 200
        })
      ));
    });

    apiService.createIteration(requestParams)
      .then (data => {
        expect(data).toEqual(responseData);
      })
      .then (() => {
        expect(apiService.iterations.length).toEqual(1);
      });
  }));

  // Test if the API returns error
  it('Create iteration with error', async(() => {
    let requestParams = resp[0];
    let url1 = 'http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations';

    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: {},
          status: 404
        })
      ));
    });

    // Error response
    apiService.createIteration(requestParams)
      .catch (data => {
        expect(data).toEqual({});
      })
      .then (() => {
        expect(apiService.iterations.length).toEqual(0);
      });
  }));

  it('Should check valid URL for iterations', () => {
    let url1 = 'http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/iterations';
    expect(apiService.checkValidIterationUrl(url1)).toEqual(true);
    let url2 = 'http://localhost:8080/api/spaces/d7d98b45-415a-4cfc-add2-ec7b7aee7dd5/invalid';
    expect(apiService.checkValidIterationUrl(url2)).toEqual(false);
    let url3 = 'http://localhost:8080/api/spaces/415a-4cfc-add2-ec7b7aee7dd5/invalid';
    expect(apiService.checkValidIterationUrl(url3)).toEqual(false);
  });

  // Patch service test
  it ('Update iteration', async(() => {
    // Assign the existing iteration value
    apiService.iterations = cloneDeep(resp);

    // Set the request params with updated name
    let requestParams = cloneDeep(resp[0]);
    requestParams.attributes.name = 'New Name';

    // Prepare the mock service and response
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: {data: requestParams},
          status: 200
        })
      ));
    });

    apiService.updateIteration(requestParams)
      .then (data => {
        console.log(apiService.iterations);
        expect(apiService.iterations[0].attributes.name).toEqual('New Name');
      });
  }));

  // Patch service test with API error
  it ('Update iteration with API error', async(() => {
    // Assign the existing iteration value
    apiService.iterations = cloneDeep(resp);

    // Set the request params with updated name
    let requestParams = cloneDeep(resp[0]);
    requestParams.attributes.name = 'New Name';

    // Prepare the mock service and response
    mockService.connections.subscribe((connection: any) => {
      connection.mockRespond(new Response(
        new ResponseOptions({
          body: {},
          status: 404
        })
      ));
    });

    apiService.updateIteration(requestParams)
      .catch (data => {
        expect(data).toEqual({});
      })
      .then (() => {
        expect(apiService.iterations[0].attributes.name).toEqual('Sprint #24');
      });
  }));

});
