import { LightningElement, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

import BOAT_REVIEW_OBJECT from '@salesforce/schema/BoatReview__c';
import NAME_FIELD from '@salesforce/schema/BoatReview__c.Name';
import COMMENT_FIELD from '@salesforce/schema/BoatReview__c.Comment__c';

const SUCCESS_TITLE = 'Review Created!';
const SUCCESS_VARIANT = 'success';

export default class BoatAddReviewForm extends LightningElement {
  // Private
  boatId;
  rating = 0;
  boatReviewObject = BOAT_REVIEW_OBJECT;
  nameField = NAME_FIELD;
  commentField = COMMENT_FIELD;
  labelSubject = 'Review Subject';
  labelRating = 'Rating';

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Getter and setter for boatId
  
    Called by:		boatDetailTabs markup
    =========================================================================*/

  get recordId() {
    return this.boatId;
  }
  @api
  set recordId(value) {
    this.boatId = value;
    this.setAttribute('boatId', this.boatId);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Update rating property when rating is changed
  
    Called by:		ratingchange event from fiveStarRating component
    =========================================================================*/

  handleRatingChanged(event) {
    this.rating = event.detail.rating;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Add Boat__c and Rating__c fields to form data before
                  submission.
  
    Called by:		submit event from lightning-record-edit-form
    =========================================================================*/

  handleSubmit(event) {
    event.preventDefault();
    let fields = event.detail.fields;
    fields.Rating__c = this.rating;
    fields.Boat__c = this.boatId;
    this.template.querySelector('lightning-record-edit-form').submit(fields);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Display toast and custom createreview event, then reset form
                  fields on lightning-record-edit-form.
  
    Called by:		success event from lightning-record-edit-form
    =========================================================================*/

  handleSuccess(event) {
    const successToast = new ShowToastEvent({
      title: SUCCESS_TITLE,
      variant: SUCCESS_VARIANT
    });
    this.dispatchEvent(successToast);
    this.dispatchEvent(new CustomEvent('createreview'));
    this.handleReset();
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Log error info from lightning-record-edit-form
  
    Called by:		error event from lightning-record-edit-form
    =========================================================================*/

  handleError(event) {
    console.log(JSON.stringify(event.detail));
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Reset all form fields including fiveStarRating component
  
    Called by:		handleSuccess
    =========================================================================*/

  handleReset() {
    const inputFields = this.template.querySelectorAll(
      'lightning-input-field'
    );
    if (inputFields) {
      inputFields.forEach(field => {
        field.reset();
      });
    }
    // reset rating field
    this.template.querySelector('c-five-star-rating').setRating(0);
  }
}