import { LightningElement, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import getAllReviews from '@salesforce/apex/BoatDataService.getAllReviews';
import { notifyRecordUpdateAvailable } from 'lightning/uiRecordApi';
// import { refreshApex } from '@salesforce/apex';

// imports
export default class BoatReviews extends NavigationMixin(LightningElement) {
  // Private
  boatId;
  error;
  boatReviews;
  isLoading;

  // Getter and Setter to allow for logic to run on recordId change
  get recordId() { }
  @api set recordId(value) {
    this.boatId = value;
    this.getReviews();
  }

  // Getter to determine if there are reviews to display
  get reviewsToShow() {
    if (this.boatReviews === null || this.boatReviews === undefined) return false;
    if (this.boatReviews.length < 1) return false;
    return true;
  }

  // Public method to force a refresh of the reviews invoking getReviews
  @api async refresh() {
    console.log('refresh started');
    this.isLoading = true;
    try {
      await notifyRecordUpdateAvailable(this.boatReviews);
      await this.getReviews();
    } catch (e) { console.log(e.body.message); }
    this.isLoading = false;
    console.log('refresh ended');
  }

  // Imperative Apex call to get reviews for given boat
  // returns immediately if boatId is empty or null
  // sets isLoading to true during the process and false when it’s completed
  // Gets all the boatReviews from the result, checking for errors.
  async getReviews() {
    this.isLoading = true;
    try {
      if (this.boatId == null || this.boatId == undefined) return;
      this.boatReviews = await getAllReviews({
        boatId: this.boatId
      });

      // await this.refresh();
    } catch (e) {
      console.log(e.body.message);
    }
    this.isLoading = false;
  }

  // Helper method to use NavigationMixin to navigate to a given record on click
  navigateToRecord(event) { }
}