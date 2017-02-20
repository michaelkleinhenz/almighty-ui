import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { Params, ActivatedRoute } from '@angular/router';
import { SpaceService, Space } from './../shared/mock-spaces.service';
import { IterationService } from './iteration.service';
import { IterationModel } from './../models/iteration.model';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { AuthenticationService } from './../auth/authentication.service';
import { Broadcaster } from './../shared/broadcaster.service';

@Component({
  selector: 'fab-planner-iteration',
  templateUrl: './iteration.component.html',
  styleUrls: ['./iteration.component.scss']
})
export class IterationComponent implements OnInit, OnDestroy {

  authUser: any = null;
  loggedIn: Boolean = false;
  isBacklogSelected: Boolean = true;
  isCollapsedIteration: Boolean = false;
  isCollapsedCurrentIteration: Boolean = false;
  isCollapsedFutureIteration: Boolean = true;
  isCollapsedPastIteration: Boolean = true;
  barchatValue: number = 70;
  allIterations: IterationModel[] = [];
  futureIterations: IterationModel[] = [];
  currentIterations: IterationModel[] = [];
  closedIterations: IterationModel[] = [];

  private spaceSubscription: Subscription = null;

  constructor(
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    private iterationService: IterationService,
    private spaceService: SpaceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.listenToEvents();
    this.loggedIn = this.auth.isLoggedIn();
    this.getAndfilterIterations();
    this.spaceSubscription = this.spaceService.getCurrentSpaceBus().subscribe(space => console.log('[IterationComponent] New Space selected: ' + space.name));
  }

  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.spaceSubscription.unsubscribe();
  }

  getAndfilterIterations() {
      this.iterationService.getIterations()
      .then((iterations) => {
          this.allIterations = iterations;
          this.clusterIterations();
      })
      .catch ((e) => {
        console.log('Some error has occured', e);
      });
  }

  clusterIterations() {
    this.futureIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'new');
    this.currentIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'start');
    this.closedIterations = this.allIterations.filter((iteration) => iteration.attributes.state === 'close');
  }

  onCreateOrupdateIteration(iteration: IterationModel) {
    let index = this.allIterations.findIndex((it) => it.id === iteration.id);
    console.log("############1");
    console.log(this.allIterations);
    if (index >= 0) {
      this.allIterations[index] = iteration;
    } else {
      this.allIterations.splice(this.allIterations.length, 0, iteration);
    }
    console.log("############2");
    console.log(this.allIterations);
    this.clusterIterations();
  }

  getWorkItemsByIteration(iteration: IterationModel) {
    let filters: any = [];
    if (iteration)
    {
      this.isBacklogSelected = false;
      filters.push({
        id:  iteration.id,
        name: iteration.attributes.name,
        paramKey: 'filter[iteration]',
        active: true,
        value: iteration.id
      });
    } else {
      //This is to view the backlog
      this.isBacklogSelected = true;
      //Collapse the other iteration sets
      this.isCollapsedCurrentIteration = true;
      this.isCollapsedFutureIteration = true;
      this.isCollapsedPastIteration = true;
      filters.push({
        paramKey: 'filter[iteration]',
        active: false,
      });
    }
    this.broadcaster.broadcast('unique_filter', filters);
  }

  listenToEvents() {
    this.broadcaster.on<string>('logout')
      .subscribe(message => {
        this.loggedIn = false;
        this.authUser = null;
    });
  }
 }
