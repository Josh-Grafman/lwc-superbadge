import { LightningElement } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';

export default class BoatSearch extends NavigationMixin(LightningElement) {
  isLoading = false;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Handler for onloading event from boatSearchResults
  
    Called by:		boatSearchResult onloading event
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  handleLoading() {
    this.isLoading = true;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Handler for ondoneloading event from boatSearchResults
  
    Called by:		boatSearchResult ondoneloading event
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  handleDoneLoading() {
    this.isLoading = false;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Call a search using the public searchBoats method of
                  boatSearchResults
  
    Called by:		search event from boatSearchForm
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  searchBoats(event) {
    this.template.querySelector('c-boat-search-results').searchBoats(event.detail.boatTypeId);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Open record creation modal for a new boat
  
    Called by:		lightning-button "New Boat"
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  createNewBoat() {
    this[NavigationMixin.Navigate]({
      type: 'standard__objectPage',
      attributes: {
        objectApiName: 'Boat__c',
        actionName: 'new',
      }
    });
  }
}