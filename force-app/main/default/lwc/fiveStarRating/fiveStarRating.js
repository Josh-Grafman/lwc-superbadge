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
  readOnly;
  @api value;

  editedValue;
  isRendered;

  //getter function that returns the correct class depending on if it is readonly
  get starClass() {
    return this.readOnly ? READ_ONLY_CLASS : EDITABLE_CLASS;
  }

  // Render callback to load the script once the component renders.
  async renderedCallback() {
    if (this.isRendered) {
      return;
    }
    await this.loadScript();
    this.initializeRating();
    this.isRendered = true;
  }

  //Method to load the 3rd party script and initialize the rating.
  //call the initializeRating function after scripts are loaded
  //display a toast with error message if there is an error loading script
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

  // Method to fire event called ratingchange with the following parameter:
  // {detail: { rating: CURRENT_RATING }}); when the user selects a rating
  ratingChanged(rating) {
    this.dispatchEvent(new CustomEvent('ratingchange', {
      detail: {
        rating: rating
      }
    }));
  }
}