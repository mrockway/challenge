$(document).ready(function(){

	$.get('/order_prices', {order_array: orders}, function(orders) {
		console.log('order from order prices',orders);
	});

	$.get('/fund_distributions', {order_array: orders}, function(distributions) {
		console.log('dist',distributions);
	});

	var feeStructure;

	// function to save fee data as a variable and then call functions once the data is saved
	function getFeeData() {
		$.getJSON('fees.json', function(data) {
		 	feeStructure = data;
			orderItemCost(orders);
			distributions(orders);
		});
	}

	// function to find the fee distribution for the order type
	function findFeeDistributionIndex(array, orderType) {
		for (var i = 0; i < array.length; i++) {
			if (array[i].order_item_type === orderType) {
				return i;
			}
		}
	}


	getFeeData();

	function orderItemCost(order) {

		// Iterate through each order in the array
		for (var i = 0; i<order.length; i++) {
			$('.orders').append('<h2> Order number: '+orders[i].order_number+'</h2>');

			// Variable to keep track of each orders individual total
			var itemTotal = 0;

			//  Iterate through each order to find the order type for each item
			for (var j = 0; j < order[i].order_items.length; j++) {

				var orderType = order[i].order_items[j].type;
				var orderPages = order[i].order_items[j].pages;

				// Finds the index of the order type in the fee structure data to determine costs
				var index = findFeeDistributionIndex(feeStructure,orderType);

				// Convert price string to an integer for calculating costs
				var feeAmount = parseInt(feeStructure[index].fees[0].amount, 10);

				// Add first page or flat rate fee for all documents
				itemTotal += feeAmount;
				$('.orders').append('<p>' + orderType + ' Fee: $'+feeAmount+'</p>');
				
				// Check to see if additional fees are associated with the order type
				if (feeStructure[index].fees.length > 1) {

					// Convert price string to an integer for calculating costs
					var additionalPagesCost = parseInt(feeStructure[index].fees[1].amount, 10);

					// Keep track of fees for order item by counting number of pages, subtracting 1 and multiplying by additional page cost
					additionalFees = additionalPagesCost * (orderPages - 1);
					itemTotal += additionalFees;

					// Check to only append results that are greater than $0
					if (additionalFees > 0 ) {
						$('.orders').append('<p>Additional page fees: $'+additionalFees+'</p>');
					}
					$('.orders').append('<h4>Item Total: $'+feeAmount+'</h4>');
				}	
			}

			$('.orders').append('<h2> Order Total: $'+itemTotal+'</h2>');
			$('.orders').append('<hr>');
		}
	}

	function distributions(order) {
		
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
		for (var i = 0; i < order.length; i++) {
			$('.distributions').append('<h2>Order Number: '+ order[i].order_number + '</h2>');
			
			// variables to record the number of item types in the order
			var individualRealPropertyRecording = 0;
			var individualBirthCertificate = 0;
			var individualOtherFunds = 0;

			// iterate through each order
			for (var j = 0; j < order[i].order_items.length; j++) {

				// variables to store item type and number of pages
				var orderType = order[i].order_items[j].type;
				var orderPages = order[i].order_items[j].pages;

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

			// only append results if Real Property Recordings are part of the order
			if (individualRealPropertyRecording > 0) {
			
				$('.distributions').append('<p>Recording Fund: $' + (realPropertyRecordingFee * individualRealPropertyRecording) + '</p>');
				$('.distributions').append('<p>Records Management Preservation Fund: $' + (recordsManagementPreservationFee * individualRealPropertyRecording) + '</p>');
				$('.distributions').append('<p>Records Archive Fund: $' + (recordsArchiveFee * individualRealPropertyRecording) + '</p>');
				$('.distributions').append('<p>Courthouse Security Fund: $' + (courthouseSecurityFee * individualRealPropertyRecording) + '</p>');
				$('.distributions').append('<p>Other: $' + individualOtherFunds + '</p>');

			}

			// only append results if Birth Certificates are part of the order
			if (individualBirthCertificate > 0) {

				$('.distributions').append('<p>County Clerk Fund: $' + (countyClerkFee * individualBirthCertificate) + '</p>');
				$('.distributions').append('<p>Vital Statistics Fund: $' + (vitalStatisticsFee * individualBirthCertificate) + '</p>');
				$('.distributions').append('<p>Vital Statistics Preservation Fund: $' + (vitalStatisticsPreservationFee * individualBirthCertificate) + '</p>');

			}
			$('.distributions').append('<hr>');
		}
		$('.distributions').append('<h2>Fund Totals for all Orders</h2>');
		$('.distributions').append('<p>Recording Fund: $' + (realPropertyRecordingFee * realPropertyRecordingType) + '</p>');
		$('.distributions').append('<p>Records Management Preservation Fund: $' + (recordsManagementPreservationFee * realPropertyRecordingType) + '</p>');
		$('.distributions').append('<p>Records Archive Fund: $' + (recordsArchiveFee * realPropertyRecordingType) + '</p>');
		$('.distributions').append('<p>Courthouse Security Fund: $' + (courthouseSecurityFee * realPropertyRecordingType) + '</p>');
		$('.distributions').append('<p>County Clerk Fund: $' + (countyClerkFee * birthCertificateType) + '</p>');
		$('.distributions').append('<p>Vital Statistics Fund: $' + (vitalStatisticsFee * birthCertificateType) + '</p>');
		$('.distributions').append('<p>Vital Statistics Preservation Fund: $' + (vitalStatisticsPreservationFee * birthCertificateType) + '</p>');
		$('.distributions').append('<p>Other: $' + otherFunds + '</p>');

	}

});