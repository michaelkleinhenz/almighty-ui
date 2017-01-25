import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';

import { IterationService } from './../iteration.service';
import { SpaceService, Space } from './../../shared/mock-spaces.service';
import { IterationModel } from './../../models/iteration.model';
import { Component, ViewChild, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';

import * as moment from 'moment';

import { IMyOptions, IMyDateModel } from 'mydatepicker';

@Component({
  selector: 'fab-planner-iteration-modal',
  templateUrl: './iteration-modal.component.html',
  styleUrls: ['./iteration-modal.component.scss']
})
export class FabPlannerIterationModalComponent implements OnInit, OnDestroy {

  private spaceSubscription: Subscription = null;

  @Output()
  public onSubmit = new EventEmitter();

  @ViewChild('createUpdateIterationDialog') createUpdateIterationDialog: any;
  public iteration: IterationModel = {
    attributes: {
      name: '',
      description: ''
    },
    relationships: {
      space: {
        data: {
          id: '',
          type: ''
        },
        links: {
          self: ''
        }
      }
    },
    id: '',
    type: 'iterations'
  } as IterationModel;
  private validationError = false;
  private modalType: string = 'create';
  private submitBtnTxt: string = 'Create';
  private modalTitle: string = 'Create Iteration';
  private startDate: any;
  private endDate: any;
  private spaceError: Boolean = false;
  private spaceName: string;

  private startDatePickerOptions: IMyOptions = {
    dateFormat: 'dd mmm yyyy',
    selectionTxtFontSize: '14px',
    openSelectorOnInputClick: true,
    editableDateField: false,
    showClearDateBtn: false,
    componentDisabled: false
  };

  private endDatePickerOptions: IMyOptions = {
    dateFormat: 'dd mmm yyyy',
    selectionTxtFontSize: '14px',
    openSelectorOnInputClick: true,
    editableDateField: false,
    showClearDateBtn: false,
    componentDisabled: false
  };

  constructor(
    private spaceService: SpaceService,
    private iterationService: IterationService) {}

  ngOnInit() {
    this.spaceSubscription = this.spaceService.getCurrentSpaceBus().subscribe(space => console.log('[FabPlannerIterationModalComponent] New Space selected: ' + space.name));
  }
  
  ngOnDestroy() {
    // prevent memory leak when component is destroyed
    this.spaceSubscription.unsubscribe();
  }

  openCreateUpdateModal(
    type: string = 'create',
    iteration: IterationModel | null = null
  ) {
    this.modalType = type;
    if (this.modalType == 'create') {
      this.submitBtnTxt = 'Create';
      this.modalTitle = 'Create Iteration';
    }
    if (this.modalType == 'start') {
      this.submitBtnTxt = 'Start';
      this.modalTitle = 'Start Iteration';
    }
    if (this.modalType == 'update') {
      this.submitBtnTxt = 'Update';
      this.modalTitle = 'Update Iteration';
      if(iteration.attributes.state === 'start') {
        let startDatePickerComponentCopy = Object.assign({}, this.startDatePickerOptions);
        startDatePickerComponentCopy.componentDisabled = true;
        this.startDatePickerOptions = startDatePickerComponentCopy;
      }
    }
    if (this.modalType == 'close') {
      this.submitBtnTxt = 'Close';
      this.modalTitle = 'Close Iteration';
    }
    if (iteration) {
      this.iteration = cloneDeep(iteration);
      if (this.iteration.attributes.startAt) {
        let startDate = moment(this.iteration.attributes.startAt);
        this.startDate = { date: { year: startDate.format('YYYY'), month: startDate.format('M'), day: startDate.format('D') } };
      }
      if (this.iteration.attributes.endAt) {
        let endDate = moment(this.iteration.attributes.endAt);
        this.endDate = { date: { year: endDate.format('YYYY'), month: endDate.format('M'), day: endDate.format('D') } };
      }
    }

    this.createUpdateIterationDialog.open();
  }

  actionOnOpen() {
    // console.log('Open');
  }

  actionOnClose() {
    //console.log('Close');
    this.resetValues();
  }

  resetValues() {
    this.iteration.attributes.name = '';
    this.iteration.attributes.description = '';
    this.iteration.relationships.space.data.id = '';
    this.validationError = false;
  }

  actionOnSubmit() {
    this.iteration.attributes.name = this.iteration.attributes.name.trim();
    if (this.iteration.attributes.name !== '') {
      this.validationError = false;
      this.spaceService.getCurrentSpace()
        .then((data) => {
          let url = data.iterationsUrl;
          this.iteration.relationships.space.data.id = data.id;
          this.spaceName = data.attributes.name;

          if (this.modalType == 'create') {
            this.iterationService.createIteration(url, this.iteration)
            .then((iteration) => {
              this.onSubmit.emit(iteration);
              this.resetValues();
              this.createUpdateIterationDialog.close();
            })
            .catch ((e) => {
              this.validationError = true;
              console.log('Some error has occured', e);
            })
          } else {
            if (this.modalType == 'start') {
              this.iteration.attributes.state = 'start';
            } else if (this.modalType == 'close') {
              this.iteration.attributes.state = 'close';
            } else {
              // Not include state if it's just an update
              delete this.iteration.attributes.state;
            }
            this.iterationService.updateIteration(this.iteration)
            .then((iteration) => {
              this.onSubmit.emit(iteration);
              this.resetValues();
              this.createUpdateIterationDialog.close();
            })
            .catch ((e) => {
              this.spaceError = true;
              // this.resetValues();
              // console.log('Some error has occured', e.toString());
            })
          }

        })
        .catch ((err: any) => {
          this.validationError = true;
          console.log('Spcae not found');
        });
      } else {
        this.validationError = true;
      }
    }

    removeError() {
      this.validationError = false;
    }
}
