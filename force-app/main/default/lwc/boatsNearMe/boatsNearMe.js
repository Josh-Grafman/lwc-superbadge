import { LightningElement, wire, api } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';
// imports
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';
export default class BoatsNearMe extends LightningElement {
  @api boatTypeId;
  mapMarkers = [];
  isLoading = true;
  isRendered;
  latitude;
  longitude;

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Get boat locations and display them
  
    Called by:		Wire service whenever lat, long, or typeId change
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
  wiredBoatsJSON({ data, error }) {
    this.isLoading = true;
    if (data) {
      this.createMapMarkers(data);
    } else if (error) {
      const errorToast = new ShowToastEvent({
        title: ERROR_TITLE,
        message: error.body.message,
        variant: ERROR_VARIANT
      });
      this.dispatchEvent(errorToast);
    }
    this.isLoading = false;
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Call getLocationFromBrowser
  
    Called by:		First component render
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  renderedCallback() {
    if (!this.isRendered) {
      this.getLocationFromBrowser();
      this.isRendered = true;
    }
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Get user's location from browser's geolocation API
  
    Called by:		renderedCallback
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  getLocationFromBrowser() {
    this.isLoading = true;
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      const { latitude, longitude } = coords;
      this.latitude = latitude;
      this.longitude = longitude;
    });
  }

  /*===========================================================================
    Author:			Josh Grafman, Upsource Solutions
    Created Date:	2023-05-15
    Description:	Parse JSON response from Apex, and add pins to array,
                  including user location
  
    Called by:		wiredBoatsJSON
    Testing Method:	---
    Test Run Date:	---
    Percentage Covered at test time:	---
    =========================================================================*/

  createMapMarkers(boatData) {
    boatData = JSON.parse(boatData);
    const newMarkers = boatData.map(boat => (
      {
        title: boat.Name,
        location: {
          Latitude: boat.Geolocation__Latitude__s,
          Longitude: boat.Geolocation__Longitude__s
        }
      }
    ));

    // add your location as the first pin
    newMarkers.unshift({
      title: LABEL_YOU_ARE_HERE,
      icon: ICON_STANDARD_USER,
      location: {
        Latitude: this.latitude,
        Longitude: this.longitude
      }
    });

    this.mapMarkers = newMarkers;
  }
}