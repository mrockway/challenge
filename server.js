// Server Side Javascript

// Declare global variables
var express = require('express');
var hbs = require('hbs');
var app = express();

// Set up static files for the public directory
app.use(express.static('public'));

// Set up view engine for hbs
app.set('view engine', 'hbs');

// require fees file
var feeStructure = require('./public/fees.json');

// function to find the fee distribution for the order type
function findFeeDistributionIndex(array, orderType) {
	for (var i = 0; i < array.length; i++) {
		if (array[i].order_item_type === orderType) {
			return i;
		}
	}
}

// Route for rendering index.hbs page and displaying order information
app.get('/', function(req,res) {
	res.render('index');
});

// API endpoint for order prices
app.get('/order_prices', function(req,res) {
	
	// save array from request parameter
	var orders = req.query.order_array;

	// declare array to save array that will store the final order costs
	var finalOrderCosts = [];

	// Iterate through each order in the array
	for (var i = 0; i<orders.length; i++) {
		var orderNumber = orders[i].order_number;

		// array to save each item in the order and its associated costs
		var orderItemArray = [];

		// Variable to keep track of each orders total
		var itemTotal = 0;

		//  Iterate through each order to find the order type for each item
		for (var j = 0; j < orders[i].order_items.length; j++) {

			// variable to store each individual order item
			var individualItemCost = 0;

			// variables to store item type and number of pages
			var orderType = orders[i].order_items[j].type;
			var orderPages = orders[i].order_items[j].pages;

			// Finds the index of the order type in the fee structure data to determine costs
			var index = findFeeDistributionIndex(feeStructure,orderType);
			
			// Convert price string to an integer for calculating costs
			var feeAmount = parseInt(feeStructure[index].fees[0].amount, 10);

			// Add first page or flat rate fee for all documents
			itemTotal += feeAmount;
			
			// Check to see if additional fees are associated with the order type
			if (feeStructure[index].fees.length > 1) {

				// Convert price string to an integer for calculating costs
				var additionalPagesCost = parseInt(feeStructure[index].fees[1].amount, 10);

				// Keep track of fees for order item by counting number of pages, subtracting 1 and multiplying by additional page cost
				additionalFees = additionalPagesCost * (orderPages - 1);

				// add additional fees to total order cost
				itemTotal += additionalFees;
			}

			// add base cost of order type and any extra fees
			individualItemCost = feeAmount + additionalFees;

			// object to add to each order which includes the type of order, base cost of that order and extra fees
			// base cost and additional fees are broken apart to be able to show the user the fees
			orderItemArray.push({'item_type' : orderType, 'item_base_cost': individualItemCost, 'item_additional_cost': additionalFees });
		}
		
		// push the order number, array of item costs, and the total cost into an object
		finalOrderCosts.push({'order_number': orderNumber , 'order_item_costs':orderItemArray, 'order_total': itemTotal });

	}

	// send the object containing each order and its associated costs back to the browser
	res.json([{'order': finalOrderCosts }]);

});

// API endpoint for fund distributions
app.get('/fund_distributions', function(req,res) {
	
	// take array from parameters and save as variable
	var orders = req.query.order_array;
		
		// Declare variables & distribution amounts for each fee type
		var realPropertyRecordingType = 0;
		var birthCertificateType = 0;
		var realPropertyRecordingFee = 5;
		var recordsManagementPreservationFee = 10;
		var recordsArchiveFee = 10;
		var courthouseSecurityFee = 1;
		var countyClerkFee = 20;
		var vitalStatisticsFee = 1;
		var vitalStatisticsPreservationFee = 1;
		var otherFunds = 0;

		// check each order for item types and num of pages
		for (var i = 0; i < orders.length; i++) {

			// variables to record the number of item types in the order
			var individualRealPropertyRecording = 0;
			var individualBirthCertificate = 0;
			var individualOtherFunds = 0;

			// iterate through each order
			for (var j = 0; j < orders[i].order_items.length; j++) {

				// variables to store item type and number of pages
				var orderType = orders[i].order_items[j].type;
				var orderPages = orders[i].order_items[j].pages;

				// Finds the index of the order type in the fee structure data to determine costs
				var index = findFeeDistributionIndex(feeStructure,orderType);

				// conditional to check what kind of item type and increasing the counters accordingly
				if (orderType === "Real Property Recording") {
					
					realPropertyRecordingType ++;
					otherFunds += (orderPages - 1);
					individualRealPropertyRecording ++;
					individualOtherFunds += (orderPages - 1);

				} else if (orderType === "Birth Certificate") {
					
					birthCertificateType ++;
					individualBirthCertificate ++;

				}
			}
		}

		// create and populate object which holds all fund distributions for a given order array
		var fundDistributionTotals = {'recording_fund': (realPropertyRecordingFee * realPropertyRecordingType),
																	'records_management_preservation_fund':  (recordsManagementPreservationFee * realPropertyRecordingType),
																	'records_archive_fund': (recordsArchiveFee * realPropertyRecordingType),
																	'courthouse_security_fund': (courthouseSecurityFee * realPropertyRecordingType),
																	'county_clerk_fund': (countyClerkFee * birthCertificateType),
																	'vital_statistics_fund': (vitalStatisticsFee * birthCertificateType),
																	'vital_statistics_preservation_fund': (vitalStatisticsPreservationFee * birthCertificateType),
																	'other_fund': otherFunds
																	
																};

	// response sent to browser															
	res.json([{'fund_order_totals': fundDistributionTotals }]);
});

// Set up app listener
var server = app.listen(process.env.PORT || 3000, function() {});