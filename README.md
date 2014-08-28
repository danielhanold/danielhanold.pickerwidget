# Picker Widget
## Overview
This is a widget for the [Alloy](http://projects.appcelerator.com/alloy/docs/Alloy-bootstrap/index.html) MVC framework of [Appcelerator](http://www.appcelerator.com)'s [Titanium](http://www.appcelerator.com/platform) platform.

This widget attempts to normalize cross-platform differences and general idiosyncrasies with the Titanium SDK. Currently, the widget needs to be initiated in the controller. The widget provides iOS and Android support for three types of pickers:

* Single-column picker
* Date picker
* Age Range picker

## Required Parameters
To open one of the pickers, specify the following variables:

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| type | `string` | Type of picker ('single-column', 'age-range', 'date-picker') |
| id | `string` | Identifier for the picker |
| outerView | `object` | View this widget should get attached to. Usually, a window. |
| hideNavBar | `boolean` | Hides the navigation bar on iOS. |
| onDone | `function` | Callback function. Gets executed when user clicks the "Done" button. |

## Callback Function
One advantage of using this widget is a uniform data format when using the "onDone" callback function. The onDone function is called with the following object:

| Key | Type | Description |
| --------- | ---- | ----------- |
| type | `string` | Type of picker ('single-column', 'age-range', 'date-picker') |
| id | `id` | Identifier for this widget (set when widget is created)
| cancel | `boolean` | Indicates if user has cancelled the entry |
| data | `object` | Hides the navigation bar on iOS. |

Depending on the type, the `data` object is composed of different elements.

### Single Column
Special case: `data` returns an array of objects for compatibility with future implementation 0f multi-column pickers.

* `key`: Key of selected option
* `value`: Value of selection option

### Age Range
* `low`: Lower selected number
* `high`: Upper selected number

### Date Picker
* `date`: Selected date as JavaScript date object
* `age`: Age (in years) based on the selected date
* `unixMilliseconds`: Selected date as Unix milliseconds timestamp
* `unixSeconds`: Selected date as Unix seconds timestamp

### Example Callback:

```
function exampleCallback(e) {
  e = e || {};
  Ti.API.error(JSON.stringify(e));
  if (e.cancel === true) {
    Ti.API.info('Entry was cancelled');
    return;
  }

  // Update a model with the correct data.
  switch (e.type) {
  case 'age-range':
    model.save({
      'target_age_min': e.data.low,
      'target_age_max': e.data.high
    });
    break;
  case 'date-picker':
    model.save('birthdate', e.data.unixSeconds);
    break;
  case 'single-column':
    model.save(e.id, Number(e.data[0].key));
    break;
  }
}
```


## Example Implementations
Here are a few example implementations to load one of the pickers.

### Single-Column Picker
This example creates a single-column picker, attaches it to a window, and populates it with some hair colors.

```
Alloy.createWidget('danielhanold.pickerWidget', {
  id: 'mySingleColumn',
  outerView: $.win,
  hideNavBar: false,
  type: 'single-column',
  selectedValues: [20],
  pickerValues: [{10: 'Auburn', 20: 'Bald', 30: 'Black', 40: 'Blond', 50: 'Brown'}],
  onDone: function(e) {
    // Do something
  },
});
```
### Range Picker
This example creates a range picker, attaches it to a window, sets the mininmum and maximum value, lower and higher values, and defines a minimum difference between the two values.

```
var overlay = Alloy.createWidget('danielhanold.pickerWidget', {
  id: 'myAgePicker',
  outerView: $.win,
  hideNavBar: false,
  type: 'age-range',
  pickerParams: {
    min: 18,
    max: 100,
    minDifference: 10
  },
  selectedValues: [23, 65],
  onDone: function(e) {
   // Do Something
  },
});
```
### Date Picker Example
This example creates a date picker, sets the minimum date to the first day of 1900 and the last day to 18 years from today and sets a default value. Alternatively, you can define a maximum selected date and display an error message if a user picks a date beyond that date.

```
// Date Picker example.
// Set minimum date to 1900.
var minDate = new Date(new Date().setYear(1900));
// Set minimum date to today - 18 years.
var maxDate = new Date(new Date().setYear(new Date().getYear()-18));
var defaultValue = maxDate;
var maxSelectedDate = new Date(new Date().setYear(new Date().getYear()-18));
var overlay = Alloy.createWidget('danielhanold.pickerWidget', {
  id: 'myDatePicker',
  outerView: $.win,
  hideNavBar: false,
  type: 'date-picker',
  pickerParams: {
    minDate: minDate,
    maxDate: maxDate,
    value: defaultValue,
    maxSelectedDate: maxSelectedDate,
    maxSelectedDateErrorMessage: 'You must be at least 18 years old.'
  },
  onDone: function(e) {
   // Do Something
  },
});
```


## Screenshot iOS
![Picker Widget Examples iOS](https://raw.githubusercontent.com/danielhanold/danielhanold.pickerwidget/master/docs/screenshot_ios.jpg)

## Screenshot Android
![Picker Widget Examples iOS](https://raw.githubusercontent.com/danielhanold/danielhanold.pickerwidget/master/docs/screenshot_android.jpg)