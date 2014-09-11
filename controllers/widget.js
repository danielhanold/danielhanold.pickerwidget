/*--------------------------------------------------------
* Initialization.
*-------------------------------------------------------*/
var args = arguments[0] || {};
var outerView = args.outerView;

// Placeholder for picker data.
var pickerData = [];

// Placeholder for keeping track of key/value pairs.
var pickerValueArray = [];

// For single-picker columns on Android, use an option dialog.
var androidSpecificTypes = ['single-column'];
var androidSpecific = (OS_ANDROID && _.contains(androidSpecificTypes, args.type));

// Placeholder elements.
var pickerView;
var picker;
var optionsDialog;



/*--------------------------------------------------------
* Initialization.
*-------------------------------------------------------*/

// On iOS, hide the nav bar if requested.
if (OS_IOS && args.hideNavBar === true) {
  outerView.hideNavBar();
}

// If specific UI elements are used on Android, don't create picker views.
if (androidSpecific) {
  switch (args.type) {
  case 'single-column':
    // Use option dialog for single-column pickers on Android.
    populateOptionsDialog();
    break;
  }
}
else {
  var overlay = Widget.createController('overlay').getView();
  // Create the controller for the picker view.
  // Pass callback functions to controller.
  var pickerController = Widget.createController('pickerView', {
    type: args.type,
    pickerParams: args.pickerParams,
    parentFunctions: {
      close: close,
      done: done
    }
  });
  pickerView = pickerController.getView('pickerView');
  picker = pickerController.getView('picker');

  outerView.add(overlay);
  outerView.add(pickerView);

  // Populate picker.
  populatePicker();
}



/*--------------------------------------------------------
* Function.
*-------------------------------------------------------*/

/**
* Generate and populate the optionsDialog.
*/
function populateOptionsDialog() {
  var selectedIndex = undefined;

  // Convert the object into array pairs.
  pickerValueArray = _.pairs(args.pickerValues[0]);

  // Iterate over all pairs and add the original
  // value (pair[1]) as a picker row.
  _.each(pickerValueArray, function(pair, index){
    pickerData.push(pair[1]);
  });

  // Determine the selected index.
  if (_.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues)) {
    selectedIndex = getKeyIndexFromPairs(pickerValueArray, args.selectedValues[0]);
  }

  // Create an options dialog.
  optionsDialog = Ti.UI.createOptionDialog({
    options: pickerData,
    buttonNames: ['Cancel'],
    selectedIndex: selectedIndex
  });
  optionsDialog.show();
  optionsDialog.addEventListener('click', done);
}

/**
* Populate the picker with data.
*/
function populatePicker() {
  switch (args.type) {
  case 'single-column':
    // Convert the object into array pairs.
    pickerValueArray = _.pairs(args.pickerValues[0]);

    // Iterate over all pairs and add the original
    // value (pair[1]) as a picker row.
    _.each(pickerValueArray, function(pair, index){
      var pickerRow = Ti.UI.createPickerRow({
        title: pair[1]
      });
      pickerData.push(pickerRow);
    });

    // Add the picker data to the picker.
    picker.add(pickerData);

    // Set the defaults.
    if (_.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues)) {
      var rowIndex = getKeyIndexFromPairs(pickerValueArray, args.selectedValues[0]);
      picker.setSelectedRow(0, rowIndex, false);
    }
    break;

  case 'age-range':
    // Set defaults for age range.
    args.pickerParams = args.pickerParams || {};
    args.pickerParams.min = args.pickerParams.min || 18;
    args.pickerParams.max = args.pickerParams.max || 100;

    var minAge = args.pickerParams.min;
    var maxAge = args.pickerParams.max;

    // Create 2 picker columns.
    var columnParams = {width: (OS_ANDROID) ? 100 : undefined};
    var pickerColumns = [Ti.UI.createPickerColumn(columnParams), Ti.UI.createPickerColumn(columnParams)];

    // Create an array with all ages.
    var agesArray = _.range(minAge, (maxAge + 1), 1);

    // Fill each column with the full age range.
    _.each(pickerColumns, function(column, index) {
      _.each(agesArray, function(age) {
        pickerColumns[index].addRow(Ti.UI.createPickerRow({
          title: String(age)
        }));
      });
    });

    // Set columns data.
    picker.setColumns(pickerColumns);

    // On iOS, reload columns to ensure they show up correctly.
    if (OS_IOS) {
      _.each(pickerColumns, function(column) {
        picker.reloadColumn(column);
      });
    }

    // Set the defaults.
    if (_.isArray(args.selectedValues) && !_.isEmpty(args.selectedValues)) {
      _.each(args.selectedValues, function(value, columnIndex) {
        var rowIndex = _.indexOf(agesArray, Number(value));
        picker.setSelectedRow(columnIndex, rowIndex, false);
      });
    }
    break;

  case 'date-picker':
    // The picker type can't bet set after the picker
    // is created on Android. See pickerView.js
    if (OS_IOS) {
      // Set the picker type to a date picker.
      picker.setType(Ti.UI.PICKER_TYPE_DATE);

      args.pickerParams = args.pickerParams || {};

      // Set the minimum and maximum date.
      if (_.isDate(args.pickerParams.minDate)) {
        picker.setMinDate(args.pickerParams.minDate);
      }
      if (_.isDate(args.pickerParams.maxDate)) {
        picker.setMaxDate(args.pickerParams.maxDate);
      }

      // Set the default value.
      if (_.isDate(args.pickerParams.value)) {
        picker.setValue(args.pickerParams.value);
      }
    }
    break;
  }
}

/**
* Get the value from a selected row.
*
* @param index
*   Index for the picker column. Defaults to 0.
*/
function getSelectedRowTitle(index) {
  index = index || 0;
  return picker.getSelectedRow(index).title;
}

/**
* Get index for key from pairs.
*
*/
function getKeyIndexFromPairs(pairs, key) {
  pairs = pairs || [];
  key = key || null;
  var rowIndex = null;

  // Determine index.
  _.each(pairs, function(pair, index) {
    if (key == pair[0]) {
      rowIndex = index;
      return;
    }
  });

  return rowIndex;
}

/**
* Determine the the key of the pair in this array.
*
* @param pairs
*   Array of pairs.
* @param title
*   Title that is currently selected.
*/
function getKeyFromPairs(pairs, title) {
  pairs = pairs || [];
  title = title || null;
  var key = null;

  // Determine key.
  _.each(pairs, function(pair) {
    if (title == pair[1]) {
      key = pair[0];
      return;
    }
  });

  return key;
}

/**
* User clicks done.
*/
function done(e) {
  // Return data.
  var data = null;

  // Boolean for cancel data.
  var cancel = false;

  switch (args.type) {
  case 'single-column':
    if (OS_IOS) {
      // Determine key and value from actual picker on iOS.
      var value = getSelectedRowTitle(0);
      var key = getKeyFromPairs(pickerValueArray, value);
      var data = [{
        key: key,
        value: value
      }];
    }

    if (OS_ANDROID) {
      // Set the data from the picker on Android.
      e = e || {};
      e.source = e.source || {};
      e.source.options = e.source.options || [];

      // Determine if the user clicked cancel.
      if (e.button === true) {
        cancel = true;
      }
      else {
        var data = [{
          key: getKeyFromPairs(pickerValueArray, e.source.options[e.index]),
          value: e.source.options[e.index]
        }];
      }
    }
    break;

  case 'age-range':
    // Get the numbers.
    var numberLow = Number(picker.getSelectedRow(0).title);
    var numberHigh = Number(picker.getSelectedRow(1).title);

    // Validation: Ensure high number is higher than low.
    if (numberLow >= numberHigh) {
      var alertDialog = Ti.UI.createAlertDialog({
        title: "Error",
        message: 'Please pick a valid age range',
        buttonNames: ['Ok']
      }).show();
      return;
    }

    // Validation: If minDifference is set, ensure age
    // difference is large enough.
    if (_.isNumber(args.pickerParams.minDifference)) {
      if ((numberHigh - numberLow) < Number(args.pickerParams.minDifference)) {
        var alertDialog = Ti.UI.createAlertDialog({
          title: "Error",
          message: 'Ages must be ' + String(args.pickerParams.minDifference) + ' years apart.',
          buttonNames: ['Ok']
        }).show();
        return;
      }
    }

    // If validation is passed, set the numbers.
    data = {
      low: numberLow,
      high: numberHigh
    }
    break;

  case 'date-picker':
    // Determine the selected date.
    var selectedDate = picker.getValue();

    // Error checking for minimum selected date.
    if (_.isDate(args.pickerParams.maxSelectedDate) && (selectedDate > args.pickerParams.maxSelectedDate)) {
      if (_.isString(args.pickerParams.maxSelectedDateErrorMessage)) {
        var message = args.pickerParams.maxSelectedDateErrorMessage;
      }
      else {
        var message = 'The date you selected is not valid';
      }
      var alertDialog = Ti.UI.createAlertDialog({
        title: "Error",
        message: message,
        buttonNames: ['Ok']
      }).show();
      return;
    }

    // @see http://stackoverflow.com/questions/4060004/calculate-age-in-javascript
    var age = Math.floor((Date.now() - selectedDate) / (31557600000));
    var unixMilliseconds = Math.round(selectedDate.getTime());
    var unixSeconds = Math.round(selectedDate.getTime() / 1000);
    data = {
      date: selectedDate,
      age: age,
      unixMilliseconds: unixMilliseconds,
      unixSeconds: unixSeconds
    }
    break;
  }

  // Close the view.
  close({
    type: args.type,
    data: data,
    cancel: cancel
  });
}

/**
* Close the window.
*/
function close(_callbackParams) {
  _callbackParams = _callbackParams || {};
  _callbackParams.type = args.type;
  _callbackParams.id = args.id || null;
  _callbackParams.data = _callbackParams.data || null;
  _callbackParams.cancel = _callbackParams.cancel || false;

  // If the navbar was supposed to be hidden, show it again.
  if (OS_IOS && args.hideNavBar === true) {
    outerView.showNavBar();
  }

  // Execute callback function if one is set.
  if (_.isFunction(args.onDone)) {
    args.onDone(_callbackParams);
  }

  // Remove elements from views.
  if (androidSpecific === false) {
    outerView.remove(overlay);
    outerView.remove(pickerView);
  }

  // Null out elements.
  overlay = null;
  pickerView = null;
  picker = null;
  optionsDialog = null;
}