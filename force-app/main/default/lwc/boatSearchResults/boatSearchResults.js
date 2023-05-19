import { LightningElement, api, wire } from 'lwc';
import getBoats from '@salesforce/apex/BoatDataService.getBoats';
import { MessageContext, publish } from 'lightning/messageService';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import updateBoatList from '@salesforce/apex/BoatDataService.updateBoatList';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';

const SUCCESS_TITLE = 'Success';
const MESSAGE_SHIP_IT = 'Ship it!';
const SUCCESS_VARIANT = 'success';
const ERROR_TITLE = 'Error';
const ERROR_VARIANT = 'error';
export default class BoatSearchResults extends LightningElement {
  selectedBoatId;
  columns = [
    { label: 'Name', type: "text", fieldName: 'Name', editable: true },
    { label: 'Length', type: "number", fieldName: 'Length__c', editable: true },
    { label: 'Price', type: "currency", typeAttributes: { currencyCode: "USD" }, fieldName: 'Price__c', editable: true },
    { label: 'Description', type: "text", fieldName: 'Description__c', editable: true }
  ];
  boatTypeId = '';
  boats;
  isLoading = false;
  boatWireData;

  // wired message context
  @wire(MessageContext)
  messageContext;

  // wired getBoats method 
  @wire(getBoats, { boatTypeId: '$boatTypeId' })
  wiredBoats(boatWireData) {
    this.boatWireData = boatWireData;
    const { data, error } = boatWireData;

    if (data) {
      this.boats = data;
    } else if (error) {
      const errorToast = new ShowToastEvent({
        title: "Error in wiredBoats",
        message: error.body.message,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(errorToast);
    };
    this.notifyLoading(false);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-11
    Description:	Sets flag for spinner and sets boat type filter property
  
    Called by:		boatSearchForm search event
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  @api
  searchBoats(boatTypeId) {
    this.notifyLoading(true);
    this.boatTypeId = boatTypeId;
    // boatTypeId is wired; no need to call an update
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-11
    Description:	Clears the cache of all boat data; sets spinner while waiting
  
    Called by:		handleSave
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  @api
  async refresh() {
    this.notifyLoading(true);
    try {
      await refreshApex(this.boatWireData);
    } catch (e) { console.log(e.body.message); }
    this.notifyLoading(false);
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-11
    Description:	Handler for a boatTile boatselect event; sets the boat Id and
    sends it into the message channel
  
    Called by:		boatselect event on boatTile
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  updateSelectedTile(event) {
    this.selectedBoatId = event.detail.boatId;
    this.sendMessageService(this.selectedBoatId);
  }


  /*===========================================================================
  Author:			Josh Grafman, Upsource Solutions
  Created Date:	2023-05-11
  Description:	Pass the Id of the selected boat to any components listening
  
    Called by:		updateSelectedTile
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  sendMessageService(boatId) {
    const message = {
      type: 'select',
      payload: {
        recordId: boatId
      }
    };
    publish(this.messageContext, BOATMC, message);
  }


  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-11
    Description:	Save changes in the lightning datatable to the db
  
    Called by:		save event
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  async handleSave(event) {
    this.notifyLoading(true);
    const updatedFields = event.detail.draftValues;
    // Update the records via Apex
    try {
      await updateBoatList({ data: updatedFields });
      const successToast = new ShowToastEvent({
        title: SUCCESS_TITLE,
        message: MESSAGE_SHIP_IT,
        variant: SUCCESS_VARIANT
      });
      this.dispatchEvent(successToast);

    } catch (error) {
      console.log(error.body.message);
      const errorToast = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT
      });
      this.isLoading = false;
      this.dispatchEvent(errorToast);
    } finally {
      // clear draft values
      this.template.querySelector("lightning-datatable").draftValues = [];
      // refresh data
      this.refresh();

      // send message to boatDetailTabs
      const message = {
        type: 'refresh',
        payload: {
          recordIds: updatedFields.map(obj => obj.Id)
        }
      };
      publish(this.messageContext, BOATMC, message);
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-11
    Description:	Set loading flag and dispatch appropriate events
  
    Called by:		wiredBoats, searchBoats, refresh, handleSave
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  notifyLoading(isLoading) {
    this.isLoading = isLoading;
    if (isLoading) {
      this.dispatchEvent(new CustomEvent('loading'));
    } else {
      this.dispatchEvent(new CustomEvent('doneloading'));
    }
  }
}
