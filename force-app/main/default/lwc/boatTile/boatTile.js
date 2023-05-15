import { LightningElement, api } from 'lwc';

const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';
export default class BoatTile extends LightningElement {
  @api boat;
  @api selectedBoatId;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Return CSS prop of Picture__c from boat
  
    Called by:		boatTile markup
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  get backgroundStyle() {
    return `background-image:url(${this.boat.Picture__c})`;
  }


  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Return classnames for tile based on boat selection
  
    Called by:		boatTile markup
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  get tileClass() {
    if (this.boat.Id == this.selectedBoatId) {
      return TILE_WRAPPER_SELECTED_CLASS;
    } else {
      return TILE_WRAPPER_UNSELECTED_CLASS;
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Dispatch boatselect event, passing Id of the boad as a detail
  
    Called by:		onClick event in boatTile component wrapper div
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  selectBoat() {
    const boatSelect = new CustomEvent('boatselect', {
      detail: {
        boatId: this.boat.Id
      }
    });
    this.dispatchEvent(boatSelect);
  }
}