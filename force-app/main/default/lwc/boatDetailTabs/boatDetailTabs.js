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

import { NavigationMixin } from 'lightning/navigation';

import getBoat from '@salesforce/apex/BoatDataService.getBoat';

const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  boatId;
  boat;
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

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Conditionally return icon for detail tab
  
    Called by:		lightning-card component
    =========================================================================*/

  get detailsTabIconName() {
    return this.boat ? 'utility:anchor' : null;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Get name of boat from wiredRecord
  
    Called by:		lightning-card component
    =========================================================================*/

  get boatName() {
    return this.boat ? this.boat.Name : null;
  }

  // Private
  subscription = null;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Subscribe to BOATMC message channel
  
    Called by:		connectedCallback
    =========================================================================*/
  // Edit:JG 2023-05-22 - Changed to use imperative Apex
  subscribeMC() {
    if (this.subscription || this.recordId) {
      return;
    }

    this.subscription = subscribe(
      this.messageContext,
      BOATMC,
      async ({ type, payload }) => {
        switch (type) {
          case 'select':
            try {
              this.boatId = payload.recordId;
              this.boat = await getBoat({ boatId: this.boatId });
            } catch (e) {
              console.error(e.message);
            }
            break;
          case 'refresh':
            try {
              this.boat = await getBoat({ boatId: this.boatId });
            } catch (e) {
              console.error(e.message);
            }
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

}