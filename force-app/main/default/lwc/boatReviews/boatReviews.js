import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;
  error;
  boatReviews;
  isLoading;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Getter and setter for boatId prop. Setter also calls for
                  review records using getReviews()
  
    Called by:		boatDetailTab markup
    =========================================================================*/

  @api
  get recordId() {
    return this.boatId;
  }
  set recordId(value) {
    this.boatId = value;
    this.setAttribute('boatId', this.boatId);
    this.getReviews();
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Utility getter to determine if boatReviews has reviews to
                  display.
  
    Called by:		Markup template conditionals
    =========================================================================*/

  @api
  get reviewsToShow() {
    if (this.boatReviews === null || this.boatReviews === undefined) return false;
    if (this.boatReviews.length < 1) return false;
    return true;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Clear cache of boatReviews, then go get them from the server.
  
    Called by:		boatDetailTabs.handleReviewCreated()
    =========================================================================*/

  @api async refresh() {
    this.isLoading = true;
    try {
      await notifyRecordUpdateAvailable(this.boatReviews);
      await this.getReviews();
    } catch (e) { console.log(e.body.message); }
    this.isLoading = false;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Get review records using imperative Apex function call.
  
    Called by:	 refresh(), set recordId()
    =========================================================================*/

  async getReviews() {
    this.isLoading = true;
    try {
      if (this.boatId == null || this.boatId == undefined) return;
      this.boatReviews = await getAllReviews({
        boatId: this.boatId
      });
    } catch (e) {
      console.log(e.body.message);
    }
    this.isLoading = false;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Navigate to User page
  
    Called by:		click event on link element showing user name
    =========================================================================*/

  navigateToRecord(event) {
    const authorId = event.target.getAttribute('data-record-id');
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        actionName: "view",
        recordId: authorId,
        objectApiName: "User"
      }
    });
  }
}