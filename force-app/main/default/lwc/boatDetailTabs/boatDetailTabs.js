import { LightningElement, wire, api } from 'lwc';
// Custom Labels Imports
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat';

import { subscribe, MessageContext, APPLICATION_SCOPE } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';

import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';

import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import { NavigationMixin } from 'lightning/navigation';


const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  wiredRecord = {};
  label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };

  // Initialize messageContext for Message Service
  @wire(MessageContext)
  messageContext;

  @wire(getRecord, { recordId: '$boatId', fields: BOAT_FIELDS })
  setWiredRecord({ data, error }) {
    if (data) {
      // unless you assign wiredRecord to a new object, the reference
      // will stay the same, and LWC won't re-evaluation the conditional
      // checks in the markup. In general it seems like LWC really wants
      // reassignment instead of mutation.
      this.wiredRecord = { ...this.wiredRecord, data: data };
    } else if (error) {
      this.boatId = undefined;
      this.wiredRecord.data = undefined;
    }
  }

  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() {
    return this.wiredRecord.data ? 'utility:anchor' : null;
  }

  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  // Private
  subscription = null;

  // Subscribe to the message channel
  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      (message) => {
        this.boatId = message.recordId;
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  // Calls subscribeMC()
  connectedCallback() {
    this.subscribeMC();
  }

  // Navigates to record page
  navigateToRecordViewPage() {
    this[NavigationMixin.Navigate]({
      type: 'standard__recordPage',
      attributes: {
        recordId: this.boatId,
        objectApiName: 'Boat__c',
        actionName: 'view'
      }
    });
  }

  // Navigates back to the review list, and refreshes reviews component
  async handleReviewCreated() {
    await this.template.querySelector('c-boat-reviews').refresh();
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
  }
}