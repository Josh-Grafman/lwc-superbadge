import { LightningElement, wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';

export default class BoatSearchForm extends LightningElement {
  selectedBoatTypeId = '';
  searchOptions = undefined;

  // Private
  error = undefined;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-09
    Description:	Gets all boat types from db to populate combobox
  
    Called by:		Wire service
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  @wire(getBoatTypes)
  boatTypes({ error, data }) {
    if (data) {
      this.searchOptions = data.map(type => ({ label: type.Name, value: type.Id }));
      this.searchOptions.unshift({ label: 'All Types', value: '' });
    } else if (error) {
      this.searchOptions = undefined;
      this.error = error;
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-09
    Description:	Handle combobox selection change and dispatch search event
  
    Called by:		onchange
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/
  handleSearchOptionChange(event) {
    this.selectedBoatTypeId = event.detail.value;

    const searchEvent = new CustomEvent('search', {
      detail: {
        boatTypeId: this.selectedBoatTypeId
      }
    });
    this.dispatchEvent(searchEvent);
  }
}