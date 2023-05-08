import { LightningElement } from 'lwc';

// imports
export default class BoatSearch extends LightningElement {
  isLoading = false;

  // Handles loading event
  handleLoading() { }

  // Handles done loading event
  handleDoneLoading() { }

  // Handles search boat event
  // This custom event comes from the form
  searchBoats(event) { }

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
