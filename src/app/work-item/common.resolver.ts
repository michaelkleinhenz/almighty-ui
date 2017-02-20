import { SpaceService, Space } from './../shared/mock-spaces.service';
import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot } from '@angular/router';
import { IterationService } from '../iteration/iteration.service';
import { IterationModel } from '../models/iteration.model';
import { UserService } from '../user/user.service';
import { User } from '../models/user';


@Injectable()
export class UsersResolve implements Resolve<User[]> {
  constructor(private userService: UserService) {}
  resolve() {
    return this.userService.getAllUsers();
  }
}

@Injectable()
export class AuthUserResolve implements Resolve<any> {
  constructor(private userService: UserService) {}
  resolve() {
    return this.userService.getUser();
  }
}

// FIX ME : Need to remove this resolver
@Injectable()
export class IterationsResolve implements Resolve<IterationModel[]> {
  constructor(private iterationService: IterationService,
              private spaceService: SpaceService) {}
  resolve() {
    this.iterationService.getIterations()
    .then(iterations => iterations)
    .catch ((e) => {
      console.log('Some error has occured', e);
    });
  }
}


