import { LightningElement, api, wire } from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import { NavigationMixin } from 'lightning/navigation';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  // Private
  currentBoat;
  relatedBoats;
  error;
  boatId;

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
    this.setAttribute('boatId', this.boatId);
  }

  @api
  similarBy;

  // Wire custom Apex call, using the import named getSimilarBoats
  // Populates the relatedBoats list
  @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
  similarBoats({ data, error }) {
    if (data) {
      this.relatedBoats = data;
    } else if (error) {
      console.error(JSON.stringify(error));
    }
  }

  get getTitle() {
    return 'Similar boats by ' + this.similarBy;
  }
  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  // Navigate to record page
  openBoatDetailPage(event) {
    const boatId = event.detail.boatId;
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        actionName: 'view',
        recordId: boatId,
        objectApiName: 'Boat__c'
      }
    });
  }
}