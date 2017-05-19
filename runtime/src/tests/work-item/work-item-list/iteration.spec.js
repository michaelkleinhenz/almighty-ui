/**Note on screen resolutions - See: http://www.itunesextractor.com/iphone-ipad-resolution.html
 * Tests will be run on these resolutions:
 * - iPhone6s - 375x667
 * - iPad air - 768x1024
 * - Desktop -  1920x1080
 *
 * beforeEach will set the mode to Desktop. Any tests requiring a different resolution will must set explicitly.
 *
 * @author naina-verma
 */

var WorkItemListPage = require('./page-objects/work-item-list.page'),
  testSupport = require('./testSupport'),
  constants = require("./constants");

describe('Iteration CRUD tests :: ', function () {
  var page;

  const workitemStatus  = {
    New: 0,
    Open: 1,
    InProgress: 2,
    Resolved: 3,
    Closed: 4
  }

  var until = protractor.ExpectedConditions;

  beforeEach(function () {
    testSupport.setBrowserMode('desktop');
    page = new WorkItemListPage(true);
  });

  /* Verify the UI buttons are present */
 it('Verify Iteration add button and label are clickable + dialoge label is present', function() {
    expect(page.iterationAddButton().isPresent()).toBe(true);
    page.clickIterationAddButton();
    expect(page.getIterationDialogTitle()).toBe('Create Iteration');
    page.clickCancelIteration();
  });

  /* Verify the helpful message */
 it('Verify Iteration helpbox is showing', function() {
    page.clickIterationAddButton();
    expect(page.getIterationDialogTitle()).toBe('Create Iteration');
    page.clickCreateIteration();
    expect(page.getHelpBoxIteration()).toBe('This field is required.');
  });

  /* Verify setting the fields in a new iteration*/
 it('Verify setting the Iteration title and description fields', function() {

    /* Create a new iteration */ 
    page.clickIterationAddButton();
    page.setIterationTitle('Newest Iteration',false);
    page.setIterationDescription('Newest Iteration',false);
    page.clickCreateIteration();

    /* Verify the new iteration is present */
    page.clickExpandFutureIterationIcon();
    browser.wait(until.presenceOf(page.lastFutureIteration), constants.WAIT, 'Failed to find theLastIteration');
   
    /* Verify that the new iteration was successfully added */ 
    expect(page.lastFutureIteration.getText()).toContain('Newest Iteration');
  }); 

  /* Query and edit an interation */
it('Query/Edit iteration', function() {
      page.clickExpandFutureIterationIcon();
      page.clickIterationKebab("1");
      page.clickEditIterationKebab();
      page.setIterationTitle('Update Iteration',false);
      page.setIterationDescription('Update Iteration',false);
      page.clickCreateIteration();
      browser.wait(until.presenceOf(page.firstFutureIteration), constants.WAIT, 'Failed to find thefirstIteration');
      expect(page.firstFutureIteration.getText()).toContain('Update Iteration');
  });

 it('Associate Workitem from detail page', function() {
      var detailPage = page.clickWorkItemTitle(page.firstWorkItem, "id0"); 
      browser.wait(until.elementToBeClickable(detailPage.workItemStateDropDownButton), constants.WAIT, 'Failed to find workItemStateDropDownButton');   
      detailPage.IterationOndetailPage().click();
      detailPage.associateIterationById("id1");
      detailPage.saveIteration();
      expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 1");
      detailPage.clickWorkItemDetailCloseButton();
    });

 it('Re-Associate Workitem from detail page', function() {
      var detailPage = page.clickWorkItemTitle(page.firstWorkItem, "id0"); 
      detailPage.IterationOndetailPage().click();
      detailPage.associateIterationById("id1");
      detailPage.saveIteration();
      expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 1");
      detailPage.clickWorkItemDetailCloseButton();
      // Re - assocaite
      page.clickWorkItemTitle(page.firstWorkItem, "id0");
      detailPage.IterationOndetailPage().click();
      detailPage.associateIterationById("id0");
      detailPage.saveIteration();
      expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 0");
      detailPage.clickWorkItemDetailCloseButton();
    });
 
 it('Filter Associate Workitem from detail page', function() {
       var detailPage = page.clickWorkItemTitle(page.firstWorkItem, "id0"); 
       detailPage.IterationOndetailPage().click();
       detailPage.associateIterationById("id0");
       detailPage.saveIteration();
       expect(detailPage.getAssociatedIteration()).toBe("/Root Iteration/Iteration 0");
       detailPage.clickWorkItemDetailCloseButton();
       page.clickExpandFutureIterationIcon();
   });
it('Verify Parent Iteration dropdown are clickable', function() {
      page.clickIterationAddButton();
      page.setIterationTitle('Newest Iteration',false);
      page.setIterationDescription('Newest Iteration',false);
      expect(page.parentIterationDropDown().isPresent()).toBe(true);
      page.clickParentIterationDropDown();
      page.searchParentIteration("iteration 1",false);
      page.selectParentIterationById("1");
      page.clickCreateIteration();
      page.clickExpandFutureIterationIcon();
  });
it('create a child Iteration', function() {
      page.clickExpandFutureIterationIcon();
      page.clickIterationKebab("1");
      page.clickChildIterationKebab();
      page.setIterationTitle('child Iteration',false);
      page.setIterationDescription('child Iteration',false);
      expect(page.parentIterationDropDown().isPresent()).toBe(true);
      page.clickParentIterationDropDown();
      page.searchParentIteration("iteration 1",false);
      page.selectParentIterationById("1");
      page.clickCreateIteration();
      expect(page.IterationsById("child Iteration").isPresent()).toBe(true);  
  });
  
 it('start / close a child Iteration', function() {
      page.clickExpandFutureIterationIcon();
      page.clickIterationKebab("1");
      page.clickStartIterationKebab();
      page.clickCreateIteration();
      expect(page.IterationsById("Iteration 0").isPresent()).toBe(true);  
      page.clickIterationKebab("1");
      page.clickCloseIterationKebab();
      page.clickCreateIteration();
      page.clickExpandPastIterationIcon();
      expect(page.IterationsById("Iteration 0").isPresent()).toBe(true);  
  });
it('Edit child Iteration', function() {
      page.clickExpandFutureIterationIcon();
      page.clickIterationKebab("1");
      page.clickStartIterationKebab();
      page.clickCreateIteration();
      expect(page.IterationsById("Iteration 0").isPresent()).toBe(true);  

      //Edit
      page.clickIterationKebab("1");
      page.clickEditIterationKebab();
      page.clickParentIterationDropDown();
      expect(page.parentIterationById("1").isPresent()).toBe(false);
      page.clickCreateIteration();  

      page.clickIterationKebab("1");
      page.clickCloseIterationKebab();
      page.clickCreateIteration();
      page.clickExpandPastIterationIcon();
      expect(page.IterationsById("Iteration 0").isPresent()).toBe(true);  
  });

  /* Verify iteration displays the correct workitem totals as workitems transition new->closed */
  // it( 'Verify counters for workitems within iteration', function() {

  //   /* TODO - Resolve Protractor issue with Angular auto-refresh/synch */
  //   browser.ignoreSynchronization = true;

  //   /* Verify that the iteration has zero workitems associated */
  //   page.clickExpandFutureIterationIcon();
  //   expect(page.getIterationCounter(page.lastFutureIteration).getText()).toBe('0');

  //   /* Associate workitems with an iteration */
  //   associateWithIteration (page, "Title Text 3", "Iteration 4");

  //   /* It was necessary to add this statement as Protractor is not able to
  //      reliably handle screen element refreshing */
  //   page.lastFutureIteration.click();

  //   expect(page.getIterationCounter(page.lastFutureIteration).getText()).toBe('1');

  //   /* Start the iteration */
  //   page.clickIterationKebab("5");
  //   page.clickStartIterationKebab();
  //   page.clickCreateIteration();
    
  //   expect(page.iterationCount.getText()).toBe('0 of 1 completed');
    
  //   setWorkItemStatus (page, "Title Text 3", workitemStatus.Closed);
  //   page.lastFutureIteration.click();
  //   expect(page.iterationCount.getText()).toBe('1 of 1 completed');

  //   /* Start the iteration */
  //   page.clickIterationKebab("1");
  //   page.clickCloseIterationKebab();
  //   page.clickCreateIteration();

  //   /* Verify that the iteration is now considered past */
  //   page.clickExpandPastIterationIcon();
  //   expect(page.firstPastIteration.getText()).toContain("Iteration 4");
  //   expect(page.getIterationCounter(page.lastPastIteration).getText()).toBe('1');   

  // });

  //it('Re-Associate WI with Iteration from Kebab menu', function() {
  //   associateWithIteration (page, "Title Text 3", "Iteration 0");
  //   associateWithIteration (page, "Title Text 3", "Iteration 1");
  //   var detailPage = page.clickWorkItemTitle(page.workItemByTitle('Title Text 3'), 'id2');
  //   expect(detailPage.getAssociatedIteration()).toContain('Iteration 1');
  // });

});

  /* Associate a work item aith an iteration */
  var associateWithIteration = function (thePage, theWorkItemTitle, theIterationTitle) {
    var until = protractor.ExpectedConditions;
    browser.wait(until.elementToBeClickable(thePage.workItemKebabButton(thePage.workItemByTitle(theWorkItemTitle))), constants.WAIT, 'Failed to find workItemKebabButton');
    thePage.clickWorkItemKebabButton(thePage.workItemByTitle(theWorkItemTitle));
    thePage.clickWorkItemKebabAssociateIterationButton(thePage.workItemByTitle(theWorkItemTitle));
    thePage.clickDropDownAssociateIteration(theIterationTitle);
    thePage.clickAssociateSave();
  }

  /* Set the status of a workitem */
  var setWorkItemStatus = function (thePage, theWorkItemTitle, theWorkItemStatus) {
    var until = protractor.ExpectedConditions;
    thePage.workItemViewId(thePage.workItemByTitle(theWorkItemTitle)).getText().then(function (text) {
      var detailPage = thePage.clickWorkItemTitle(thePage.workItemByTitle(theWorkItemTitle), text);
      browser.wait(until.elementToBeClickable(detailPage.workItemStateDropDownButton), constants.WAIT, 'Failed to find workItemStateDropDownButton');   
      detailPage.clickWorkItemStateDropDownButton();
      browser.wait(until.elementToBeClickable(detailPage.WorkItemStateDropDownList().get(theWorkItemStatus)), constants.WAIT, 'Failed to find workItemStateDropDownButton');   
      detailPage.WorkItemStateDropDownList().get(theWorkItemStatus).click();
      detailPage.clickWorkItemDetailCloseButton();
    });
  }

