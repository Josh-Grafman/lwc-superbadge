import { LightningElement, api, wire } from 'lwc';
import getSimilarBoats from '@salesforce/apex/BoatDataService.getSimilarBoats';
import { NavigationMixin } from 'lightning/navigation';

export default class SimilarBoats extends NavigationMixin(LightningElement) {
  // Private
  currentBoat;
  relatedBoats;
  error;
  boatId;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Getter and setter for recordId
  
    Called by:		Lightning Record Page
    =========================================================================*/

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

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Set related boats when boatId and similarBy are set
  
    Called by:		Wire Service
    =========================================================================*/

  @wire(getSimilarBoats, { boatId: '$boatId', similarBy: '$similarBy' })
  similarBoats({ data, error }) {
    if (data) {
      this.relatedBoats = data;
    } else if (error) {
      console.error(JSON.stringify(error));
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Dynamically set title for lightning-card
  
    Called by:		lightning-card
    =========================================================================*/

  get getTitle() {
    return 'Similar boats by ' + this.similarBy;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Return true if there are no similar boats, otherwise return
                  false.
  
    Called by:		Component conditional rendering
    =========================================================================*/

  get noBoats() {
    return !(this.relatedBoats && this.relatedBoats.length > 0);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Navigate to Boat__c page
  
    Called by:		boatselect event from boatTile component
    =========================================================================*/

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