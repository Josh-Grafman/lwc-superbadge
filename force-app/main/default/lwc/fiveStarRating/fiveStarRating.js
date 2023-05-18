import { LightningElement, api } from 'lwc';
import fivestar from '@salesforce/resourceUrl/fivestar';
import { loadScript, loadStyle } from 'lightning/platformResourceLoader';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';

const ERROR_TITLE = 'Error loading five-star';
const ERROR_VARIANT = 'error';
const EDITABLE_CLASS = 'c-rating';
const READ_ONLY_CLASS = 'readonly c-rating';

export default class FiveStarRating extends LightningElement {
  //initialize public readOnly and value properties
  @api readOnly;
  @api value;

  editedValue;
  isRendered;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-16
    Description:	Conditional styling utility getter

    Called by:		fiveStarRating markup
    =========================================================================*/

  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-16
    Description:	Procures static resources for this component and inits

    Called by:		LWC lifecycle - first render
    =========================================================================*/

  async renderedCallback() {
    if (this.isRendered) {
      return;
    }
    await this.loadScript();
    this.initializeRating();
    this.isRendered = true;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-16
    Description:	Procure static resources

    Called by:		renderedCallback
    =========================================================================*/

  async loadScript() {
    try {
      await loadScript(this, fivestar + '/rating.js');
      await loadStyle(this, fivestar + '/rating.css');
    } catch (e) {
      // const error = { body: { message: e.message } };
      const errorToast = new ShowToastEvent({
        title: ERROR_TITLE,
        message: e.message,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(errorToast);
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-16
    Description:	Initializes values for this component and sets it on the window

    Called by:		renderedCallback
    =========================================================================*/

  initializeRating() {
    let domEl = this.template.querySelector('ul');
    let maxRating = 5;
    let self = this;
    let callback = function (rating) {
      self.editedValue = rating;
      self.ratingChanged(rating);
    };
    this.ratingObj = window.rating(
      domEl,
      this.value,
      maxRating,
      callback,
      this.readOnly
    );
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Custom function to set the rating of this component
  
    Called by:		boatAddReview component when review is submitted
    =========================================================================*/

  @api setRating(value) {
    this.value = value;
    // customized this function internally to know when it is being reset
    this.ratingObj.setRating(this.value, false, true);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-18
    Description:	Dispatch ratingchange event when star is clicked
  
    Called by:		Callback function in initializeRating, passed in to component
                  static resource code.
    =========================================================================*/

  ratingChanged(rating) {
    this.dispatchEvent(new CustomEvent('ratingchange', {
      detail: {
        rating: rating
      }
    }));
  }
}