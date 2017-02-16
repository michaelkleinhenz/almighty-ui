import {
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewChildren,
  QueryList, TemplateRef
} from '@angular/core';
import {
  Router,
  ActivatedRoute
} from '@angular/router';
import { cloneDeep } from 'lodash';

import { AuthenticationService } from '../../auth/authentication.service';
import { Broadcaster } from '../../shared/broadcaster.service';
import { Logger } from '../../shared/logger.service';

import { WorkItem } from '../../models/work-item';
import { WorkItemType }               from '../work-item-type';
import { WorkItemListEntryComponent } from './work-item-list-entry/work-item-list-entry.component';
import { WorkItemService }            from '../work-item.service';
import { UserService } from '../../user/user.service';
import { User } from '../../models/user';

import { TreeListComponent } from '../../shared-component/treelist/treelist.component';

@Component({
  selector: 'alm-work-item-list',
  templateUrl: './work-item-list.component.html',
  styleUrls: ['./work-item-list.component.scss']
})
export class WorkItemListComponent implements OnInit, AfterViewInit {

  @ViewChildren('activeFilters', {read: ElementRef}) activeFiltersRef: QueryList<ElementRef>;
  @ViewChild('activeFiltersDiv') activeFiltersDiv: any;

  @ViewChild('listContainer') listContainer: any;
  @ViewChild('template') listItemTemplate: TemplateRef<any>;
  @ViewChild('treeList') treeList: TreeListComponent;

  workItems: WorkItem[];
  workItemTypes: WorkItemType[];
  selectedWorkItemEntryComponent: WorkItemListEntryComponent;
  workItemToMove: WorkItemListEntryComponent;
  workItemDetail: WorkItem;
  addingWorkItem = false;
  showOverlay : Boolean ;
  loggedIn: Boolean = false;
  showWorkItemDetails: boolean = false;
  contentItemHeight: number = 67;
  pageSize: number = 20;
  filters: any[] = [];
  allUsers: User[] = [] as User[];
  authUser: any = null;

  // See: https://angular2-tree.readme.io/docs/options
  treeListOptions = {
    allowDrag: true
  }

  constructor(
    private auth: AuthenticationService,
    private broadcaster: Broadcaster,
    private router: Router,
    private user: UserService,
    private workItemService: WorkItemService,
    private logger: Logger,
    private userService: UserService,
    private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.listenToEvents();
    this.loggedIn = this.auth.isLoggedIn();
    // console.log('ALL USER DATA', this.route.snapshot.data['allusers']);
    // console.log('AUTH USER DATA', this.route.snapshot.data['authuser']);
  }

  ngAfterViewInit() {
    let oldHeight = 0;
    this.allUsers = cloneDeep(this.route.snapshot.data['allusers']) as User[];
    this.authUser = cloneDeep(this.route.snapshot.data['authuser']);
  }

  // model handlers

  initWiItems(event: any): void {
    this.pageSize = event.pageSize;
    this.loadWorkItems();
  }

  loadWorkItems(): void {
    this.workItemService
      .getWorkItems(this.pageSize, this.filters)
      .then((wItems) => {
        this.workItems = wItems;
      });
  }

  fetchMoreWiItems(): void {
    this.workItemService
      .getMoreWorkItems()
      .then((newWiItems) => {
        this.treeList.updateTree();
      })
      .catch ((e) => console.log(e));
  }

  // event handlers
  onToggle(entryComponent: WorkItemListEntryComponent): void {
    // This condition is to select a single work item for movement
    // deselect the previous checked work item
    if (this.workItemToMove) {
      this.workItemToMove.uncheck();
    }
    if (this.workItemToMove == entryComponent) {
      this.workItemToMove = null;
    } else {
      entryComponent.check();
      this.workItemToMove = entryComponent;
    }
  }

  onSelect(entryComponent: WorkItemListEntryComponent): void {
    let workItem: WorkItem = entryComponent.getWorkItem();
    // de-select prior selected element (if any)
    if (this.selectedWorkItemEntryComponent && this.selectedWorkItemEntryComponent != entryComponent) {
      this.selectedWorkItemEntryComponent.deselect();
    }
    // select new component
    entryComponent.select();
    this.selectedWorkItemEntryComponent = entryComponent;
  }

  onDetail(entryComponent: WorkItemListEntryComponent): void {
    this.workItemDetail = entryComponent.getWorkItem();
    this.onSelect(entryComponent);
    this.showWorkItemDetails = true;
  }

  onMoveSelectedToTop(): void{
    this.workItemDetail = this.workItemToMove.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'top').then(() => {
      this.treeList.updateTree();
      this.listContainer.nativeElement.scrollTop = 0;
    });
  }

  onMoveSelectedToBottom(): void{
    this.workItemDetail = this.workItemToMove.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'bottom').then(() => {
      this.treeList.updateTree();
      this.listContainer.nativeElement.scrollTop = this.workItems.length * this.contentItemHeight;
    });
  }

  onMoveToTop(entryComponent: WorkItemListEntryComponent): void {
    this.workItemDetail = entryComponent.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'top')
    .then(() => {
      this.treeList.updateTree();
      this.listContainer.nativeElement.scrollTop = 0;
    });
  }

  onMoveToBottom(entryComponent: WorkItemListEntryComponent): void {
    this.workItemDetail = entryComponent.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'bottom')
    .then(() => {
      this.treeList.updateTree();
      this.listContainer.nativeElement.scrollTop = this.workItems.length * this.contentItemHeight;
    });
  }

  onMoveUp(): void {
    this.workItemDetail = this.workItemToMove.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'up');
    this.treeList.updateTree();
  }

  onMoveDown(): void {
    this.workItemDetail = this.workItemToMove.getWorkItem();
    this.workItemService.moveItem(this.workItemDetail, 'down');
    this.treeList.updateTree();
  }

  listenToEvents() {
    this.broadcaster.on<string>('logout')
      .subscribe(message => {
        this.loggedIn = false;
        this.authUser = null;
    });
    this.broadcaster.on<string>('item_filter')
      .subscribe((filters: any) => {
        this.filters = filters;
        this.loadWorkItems();
    });
    this.broadcaster.on<string>('move_item')
      .subscribe((moveto: string) => {
        switch (moveto){
          case 'up':
            this.onMoveUp();
            break;
          case 'down':
            this.onMoveDown();
            break;
          case 'top':
            this.onMoveSelectedToTop();
            break;
          case 'bottom':
            this.onMoveSelectedToBottom();
            break;
          default:
            break;
        }
    });
  }

  onDragStart() {
    //console.log('on drag start');
  }

  // Event listener for WI drop.
  onDragEnd(workItemId: string) {
    // rearrange is happening inside ng2-dnd library

    // Build the ID-index map after rearrange.
    this.workItemService.buildWorkItemIdIndexMap();

    // save the order of work item.
    this.workItemService.reOrderWorkItem(workItemId)
        .catch (e => console.log(e));
  }
}
