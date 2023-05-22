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

import { refreshApex } from '@salesforce/apex';

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
  setWiredRecord(result) {
    const { data, error } = result;
    if (data) {
      // unless you assign wiredRecord to a new object, the reference
      // will stay the same, and LWC won't re-evaluation the conditional
      // checks in the markup. In general it seems like LWC really wants
      // reassignment instead of mutation.
      this.refreshRecord = result;
      this.wiredRecord = { ...this.wiredRecord, data: data };
    } else if (error) {
      this.boatId = undefined;
      this.wiredRecord.data = undefined;
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Conditionally return icon for detail tab
  
    Called by:		lightning-card component
    =========================================================================*/

  get detailsTabIconName() {
    return this.wiredRecord.data ? 'utility:anchor' : null;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Get name of boat from wiredRecord
  
    Called by:		lightning-card component
    =========================================================================*/

  get boatName() {
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }

  // Private
  subscription = null;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Subscribe to BOATMC message channel
  
    Called by:		connectedCallback
    =========================================================================*/

  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      ({ type, payload }) => {
        switch (type) {
          // blow away the cache every time
          case 'select':
            this.boatId = payload.recordId;
            this.refresh();
            break;
          case 'refresh':
            this.refresh();
            break;
          default:
            break;
        }
      },
      { scope: APPLICATION_SCOPE }
    );
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Call subscribeMC
  
    Called by:		LWC lifecycle
    =========================================================================*/

  connectedCallback() {
    this.subscribeMC();
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Navigate to boat record
  
    Called by:		lightning-button onclick
    =========================================================================*/

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

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Refresh boat review records, then navigate to reviews tab
  
    Called by:		createreview event from c-boat-add-review-form
    =========================================================================*/

  async handleReviewCreated() {
    await this.template.querySelector('c-boat-reviews').refresh();
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-19
    Description:	Refresh record from db in response to an edit in
                  boatSearchResults.

    Called by:		subscribeMC
    =========================================================================*/

  refresh() {
    refreshApex(this.refreshRecord);
  }
}