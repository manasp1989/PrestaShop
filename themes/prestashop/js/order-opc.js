/*
* 2007-2011 PrestaShop 
*
* NOTICE OF LICENSE
*
* This source file is subject to the Open Software License (OSL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/osl-3.0.php
* If you did not receive a copy of the license and are unable to
* obtain it through the world-wide-web, please send an email
* to license@prestashop.com so we can send you a copy immediately.
*
* DISCLAIMER
*
* Do not edit or add to this file if you wish to upgrade PrestaShop to newer
* versions in the future. If you wish to customize PrestaShop for your
* needs please refer to http://www.prestashop.com for more information.
*
*  @author PrestaShop SA <contact@prestashop.com>
*  @copyright  2007-2011 PrestaShop SA
*  @version  Release: $Revision: 1.4 $
*  @license    http://opensource.org/licenses/osl-3.0.php  Open Software License (OSL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*/

function updateCarrierList(json)
{
	var carriers = json.carriers;
	
	/* contains all carrier available for this address */
	if (carriers.length == 0)
	{
		$('input[name=id_carrier]:checked').attr('checked', false);
		$('#noCarrierWarning').show();
		$('#extra_carrier').hide();
		$('#recyclable_block').hide();
		$('table#carrierTable:visible').hide();
	}
	else
	{
		var html = '';
		for (i=0;i<carriers.length; i++)
		{
			var itemType = '';
			
			if (i == 0)
				itemType = 'first_item ';
			else if (i == carriers.length-1)
				itemType = 'last_item ';
			if (i % 2)
				itemType = itemType + 'alternate_item';
			else
				itemType = itemType + 'item';
			
			var name = carriers[i].name;
			if (carriers[i].img != '')
				name = '<img src="'+carriers[i].img+'" alt="" />';
				
			html = html + 
			'<tr class="'+itemType+'">'+
				'<td class="carrier_action radio"><input type="radio" name="id_carrier" value="'+carriers[i].id_carrier+'" id="id_carrier'+carriers[i].id_carrier+'" '+((checkedCarrier == carriers[i].id_carrier || carriers.length == 1) ? 'checked="checked"' : '')+' /></td>'+
				'<td class="carrier_name"><label for="id_carrier'+carriers[i].id_carrier+'">'+name+'</label></td>'+
				'<td class="carrier_infos">'+carriers[i].delay+'</td>'+
				'<td class="carrier_price"><span class="price">'+formatCurrency(carriers[i].price, currencyFormat, currencySign, currencyBlank)+'</span>';
			if (taxEnabled && displayPrice == 0)
				html = html + ' ' + txtWithTax;
			else
				html = html + ' ' + txtWithoutTax;
			html = html + '</td>'+
			'</tr>';
		}
		if (json.HOOK_EXTRACARRIER !== null) html += json.HOOK_EXTRACARRIER;
		$('#noCarrierWarning').hide();
		$('#extra_carrier:hidden').show();
		$('table#carrierTable tbody').html(html);
		$('table#carrierTable:hidden').show();
		$('#recyclable_block:hidden').show();
	}
	
	/* update hooks for carrier module */
	$('#HOOK_BEFORECARRIER').html(json.HOOK_BEFORECARRIER);
}

function updateAddressesStatus()
{
	var nameAddress_delivery = $('select#id_address_delivery option:selected').html();
	var nameAddress_invoice = $('input[type=checkbox]#addressesAreEquals:checked').length == 1 ? nameAddress_delivery : ($('select#id_address_invoice').length == 1 ? $('select#id_address_invoice option:selected').html() : nameAddress_delivery);

	$('span#opc_status-address_delivery').html(nameAddress_delivery);
	$('span#opc_status-address_invoice').html(nameAddress_invoice);
}

function updateCarrierStatus()
{
	if (isVirtualCart == 1)
	{
		$('#opc_block_2_status').css('color', 'green').html('<p>'+txtNoCarrierIsNeeded+'</p>');
	}
	else
	{
		if ($('input[name=id_carrier]:checked').length != 0)
		{
			var name = $('label[for='+$('input[name=id_carrier]:checked').attr('id')+']').html();
			$('#opc_block_2_status').css('color', 'green').html('<p>"'+name+'" '+txtHasBeenSelected+'</p>');
		}
		else
			$('#opc_block_2_status').css('color', 'red').html('<p>'+txtNoCarrierIsSelected+'</p>');
	}
}

function updateTOSStatus()
{
	if (conditionEnabled)
	{
		if ($('input#cgv:checked').length != 0)
			$('#opc_block_3_status').css('color', 'green').html('<p>'+txtTOSIsAccepted+'</p>');
		else
			$('#opc_block_3_status').css('color', 'red').html('<p>'+txtTOSIsNotAccepted+'</p>');
	}
	else
		$('#opc_block_3_status').css('color', 'green').html('<p>'+txtConditionsIsNotNeeded+'</p>');
}

function showPaymentModule()
{
	$.ajax({
	       type: 'POST',
	       url: orderOpcUrl,
	       async: true,
	       cache: false,
	       dataType : "html",
	       data: 'ajax=true&method=getPaymentModule&token=' + static_token ,
	       success: function(html)
	        {
	       		var array_split = html.split(':');
				if (array_split[0] === 'freeorder')
	       		{
	       			if (isGuest)
	       				document.location.href = guestTrackingUrl+'?id_order='+encodeURI(array_split[1])+'&email='+encodeURI(array_split[2]);
	       			else
	       				document.location.href = historyUrl;
	       		}
	       		else
	       			$('#opc_payment_list').html(html);
	    	},
	       error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to show payment modules \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
	   });
	return false;
}

function getCarrierListAndUpdate()
{
	$.ajax({
        type: 'POST',
        url: orderOpcUrl,
        async: true,
        cache: false,
        dataType : "json",
        data: 'ajax=true&method=getCarrierList&token=' + static_token,
        success: function(jsonData)
        {
				if (jsonData.hasError)
				{
					var errors = '';
					for(error in jsonData.errors)
						//IE6 bug fix
						if(error != 'indexOf')
							errors += jsonData.errors[error] + "\n";
					alert(errors);
				}
				else
					updateCarrierList(jsonData);
        		updateCarrierStatus();
			}
	});
}

function updateAddressesAndCarriersList()
{
	var idAddress_delivery = ($('input#opc_id_address_delivery').length == 1 ? $('input#opc_id_address_delivery').val() : $('select#id_address_delivery').val());
	var idAddress_invoice = ($('input#opc_id_address_invoice').length == 1 ? $('input#opc_id_address_invoice').val() : ($('input[type=checkbox]#addressesAreEquals:checked').length == 1 ? idAddress_delivery : ($('select#id_address_invoice').length == 1 ? $('select#id_address_invoice').val() : idAddress_delivery)));
	
	$.ajax({
           type: 'POST',
           url: orderOpcUrl,
           async: true,
           cache: false,
           dataType : "json",
           data: 'processAddress=true&step=2&ajax=true&id_address_delivery=' + idAddress_delivery + '&id_address_invoice=' + idAddress_invoice + '&token=' + static_token,
           success: function(jsonData)
           {
           		if (jsonData.hasError)
				{
					var errors = '';
					for(error in jsonData.errors)
						//IE6 bug fix
						if(error != 'indexOf')
							errors += jsonData.errors[error] + "\n";
					alert(errors);
				}
				else
				{
					updateCarrierList(jsonData);
					updateCartSummary(jsonData.summary);
					updateHookShoppingCart(jsonData.HOOK_SHOPPING_CART);
					updateHookShoppingCartExtra(jsonData.HOOK_SHOPPING_CART_EXTRA);
					updateAddressesStatus();
				}
           		updateCarrierStatus();
			},
           error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to save adresses \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
	});
}

function updateCarrierSelectionAndGift()
{
	var recyclablePackage = 0;
	var gift = 0;
	var giftMessage = '';
	var idCarrier = 0;

	if ($('input#recyclable:checked').length)
		recyclablePackage = 1;
	if ($('input#gift:checked').length)
	{
		gift = 1;
		giftMessage = encodeURI($('textarea#gift_message').val());
	}
	
	if ($('input[name=id_carrier]:checked').length)
	{
		idCarrier = $('input[name=id_carrier]:checked').val();
		checkedCarrier = idCarrier;
	}
	
	$.ajax({
       type: 'POST',
       url: orderOpcUrl,
       async: false,
       cache: false,
       dataType : "json",
       data: 'ajax=true&method=updateCarrier&id_carrier=' + idCarrier + '&recyclable=' + recyclablePackage + '&gift=' + gift + '&gift_message=' + giftMessage + '&token=' + static_token ,
       success: function(jsonData)
       {
       		if (jsonData.hasError)
    		{
    			var errors = '';
    			for(error in jsonData.errors)
    				//IE6 bug fix
    				if(error != 'indexOf')
    					errors += jsonData.errors[error] + "\n";
    			alert(errors);
    		}
    		else
    		{
    			updateCartSummary(jsonData);
    			updateHookShoppingCart(jsonData.HOOK_SHOPPING_CART);
				updateHookShoppingCartExtra(jsonData.HOOK_SHOPPING_CART_EXTRA);
    		}
    		updateCarrierStatus();
    	},
       error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to save carrier \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
   });
}

function saveAddress(type)
{
	if (type != 'delivery' && type != 'invoice')
		return false;
	
	var params = 'firstname='+encodeURI($('#firstname').val())+'&lastname='+encodeURI($('#lastname').val())+'&';
	params += 'company='+encodeURI($('#company'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'vat_number='+encodeURI($('#vat_number'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'dni='+encodeURI($('#dni'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'address1='+encodeURI($('#address1'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'address2='+encodeURI($('#address2'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'postcode='+encodeURI($('#postcode'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'city='+encodeURI($('#city'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'id_country='+encodeURI($('#id_country'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'id_state='+encodeURI($('#id_state'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'other='+encodeURI($('#other'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'phone='+encodeURI($('#phone'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'phone_mobile='+encodeURI($('#phone_mobile'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	params += 'alias='+encodeURI($('#alias'+(type == 'invoice' ? '_invoice' : '')).val())+'&';
	// Clean the last &
	params = params.substr(0, params.length-1);

	var result = false;
	
	$.ajax({
       type: 'POST',
       url: addressUrl,
       async: false,
       cache: false,
       dataType : "json",
       data: 'ajax=true&submitAddress=true&type='+type+'&'+params+'&token=' + static_token,
       success: function(jsonData)
       {
			if (jsonData.hasError)
			{
       			var tmp = '';
       			var i = 0;
				for(error in jsonData.errors)
					//IE6 bug fix
					if(error != 'indexOf')
					{
						i = i+1;
						tmp += '<li>'+jsonData.errors[error]+'</li>';
					}
				tmp += '</ol>';
				var errors = '<b>'+txtThereis+' '+i+' '+txtErrors+':</b><ol>'+tmp;
				$('#opc_account_errors').html(errors).slideDown('slow');
				result = false;
			}
			else
			{
				// update addresses id
				$('input#opc_id_address_delivery').val(jsonData.id_address_delivery);
				$('input#opc_id_address_invoice').val(jsonData.id_address_invoice);
	
				result = true;
			}
		},
       error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to save adresses \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
    });

	return result;
}

function manageButtonsEvents(button)
{
	var hasError = false;
	var opc_button_clicked = button;	
	
	/* Exception cases + error tracking */
	/**
	 * #opc_block_1 : Login / Addresses
	 * #opc_block_2 : Delivery Methods
	 * #opc_block_3 : Terms of service
	 * #opc_block_4 : Payment methods
	 */
	if (button.attr('href') == '#opc_block_2' && $('.opc_block_content:visible').attr('id') != 'opc_block_3')
		updateAddressesAndCarriersList();
	
	if (button.attr('href') == '#opc_block_2' && isVirtualCart == 1)
	{
		if ($('.opc_block_content:visible').attr('id') == 'opc_block_3')
			button.attr('href', '#opc_block_1');
		else
			button.attr('href', '#opc_block_3');
	}
	
	if (button.attr('href') == '#opc_block_3' && $('input[name=id_carrier]:checked').length == 0 && isVirtualCart == 0)
	{
		alert(errorCarrier);
		hasError = true;
	}
	
	if (button.attr('href') == '#opc_block_3' && !hasError && !conditionEnabled)
		if ($('.opc_block_content:visible').attr('id') == 'opc_block_4')
		{
			if (isVirtualCart == 1)
				button.attr('href', '#opc_block_1');
			else
				button.attr('href', '#opc_block_2');
		}
		else
		{
			updateCarrierSelectionAndGift();
			button.attr('href', '#opc_block_4');
		}
	
	if (button.attr('href') == '#opc_block_4' && $('input[name=cgv]:checked').length == 0 && conditionEnabled)
	{
		alert(errorTOS);
		hasError = true;
	}
	
	if (!hasError)
	{
		if (button.attr('href') == '#opc_block_3')
			updateCarrierSelectionAndGift();
		if (button.attr('href') == '#opc_block_4')
			showPaymentModule();
		$('.opc_block_content:visible').slideUp('slow', function() {
			$(opc_button_clicked.attr('href')).slideDown('slow', function() {
				$('.opc_status').each(function() {
					if ($(this).attr('id') != $('.opc_block_content:visible').attr('id')+'_status')
						$(this).slideDown('slow');
					else
						$(this).slideUp('slow');
				});
			});
		});
	}
	return false;
}

$(function() {
	// Init
	$('.opc_status').show();
	$('.opc_block_content').hide();
	var step = 1;
	if (isPaymentStep == true)
	{
		step = 4;
		showPaymentModule();
	}
	$('#opc_block_'+step).show();
	$('#opc_block_'+step+'_status').hide();
	
	// Event
	$('.opc_button').click(function() { manageButtonsEvents($(this));return false; });

	// GUEST CHECKOUT / NEW ACCOUNT MANAGEMENT
	if ((!isLogged) || (isGuest))
	{
		if (guestCheckoutEnabled && !isLogged)
		{
			$('#opc_account_choice').show();
			$('#opc_account_form').hide();
			$('#opc_invoice_address').hide();
			
			$('#opc_createAccount').click(function() {
				$('.is_customer_param').show();
				$('#opc_account_form').slideDown('slow');
				$('#is_new_customer').val('1');
				$('#opc_account_choice').hide();
				$('#opc_invoice_address').hide();
				updateState();
				updateNeedIDNumber();
				updateZipCode();
			});
			$('#opc_guestCheckout').click(function() {
				$('.is_customer_param').hide();
				$('#opc_account_form').slideDown('slow');
				$('#is_new_customer').val('0');
				$('#opc_account_choice').hide();
				$('#opc_invoice_address').hide();
				$('#new_account_title').html(txtInstantCheckout);
				updateState();
				updateNeedIDNumber();
				updateZipCode();
			});
		}
		else if (isGuest)
		{
			$('.is_customer_param').hide();
			$('#opc_account_form').show('slow');
			$('#is_new_customer').val('0');
			$('#opc_account_choice').hide();
			$('#opc_invoice_address').hide();
			$('#new_account_title').html(txtInstantCheckout);
			updateState();
			updateNeedIDNumber();
			updateZipCode();
		}
		else
		{
			$('#opc_account_choice').hide();
			$('#is_new_customer').val('1');
			$('.is_customer_param').show();
			$('#opc_account_form').show();
			$('#opc_invoice_address').hide();
			updateState();
			updateNeedIDNumber();
			updateZipCode();
		}
		
		// LOGIN FORM
		$('#openLoginFormBlock').click(function() {
			$('#openNewAccountBlock').show();
			$(this).hide();
			$('#login_form_content').slideDown('slow');
			$('#new_account_form_content').slideUp('slow');
			return false;
		});
		// LOGIN FORM SENDING
		$('#SubmitLogin').click(function() {
			$.ajax({
				type: 'POST',
				url: authenticationUrl,
				async: false,
				cache: false,
				dataType : "json",
				data: 'SubmitLogin=true&ajax=true&email='+encodeURI($('#login_email').val())+'&passwd='+encodeURI($('#passwd').val())+'&token=' + static_token ,
				success: function(jsonData)
				{
					if (jsonData.hasError)
					{
						var errors = '<b>'+txtThereis+' '+jsonData.errors.length+' '+txtErrors+':</b><ol>';
						for(error in jsonData.errors)
							//IE6 bug fix
							if(error != 'indexOf')
								errors += '<li>'+jsonData.errors[error]+'</li>';
						errors += '</ol>';
						$('#opc_login_errors').html(errors).slideDown('slow');
					}
					else
					{
						$.ajax({
							type: 'POST',
							url: orderOpcUrl,
							async: true,
							cache: false,
							dataType : "json",
							data: 'ajax=true&method=getAddressBlock&token=' + static_token ,
							success: function(json)
							{
								$('#opc_dynamic_block_1').fadeOut('fast', function() {
									$('#opc_dynamic_block_1').html(json.order_opc_adress);
									// update block user info
									if (json.block_user_info != '' && $('#header_user').length == 1)
									{
										$('#header_user').fadeOut('slow', function() {
											$(this).attr('id', 'header_user_old').after(json.block_user_info).fadeIn('slow');
											$('#header_user_old').remove();
										});
									}
									$('#opc_block_1_status').hide();
									updateAddressesDisplay(true);
									$('#opc_dynamic_block_1').fadeIn('fast');
									// Event
									$('.opc_button').click(function() { manageButtonsEvents($(this));return false; });
								});
							},
							error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to send login informations \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
						});
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to send login informations \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
			});
			return false;
		});
		
		// INVOICE ADDRESS
		$('#invoice_address').click(function() {
			if ($('#invoice_address:checked').length > 0)
			{
				$('#opc_invoice_address').slideDown('slow');
				if ($('#company_invoice').val() == '')
					$('#vat_number_block_invoice').hide();
				updateState('invoice');
				updateNeedIDNumber('invoice');
				updateZipCode('invoice');
			}
			else
				$('#opc_invoice_address').slideUp('slow');
		});
		
		// VALIDATION / CREATION AJAX
		$('#submitAccount').click(function() {
			// RESET ERROR(S) MESSAGE(S)
			$('#opc_account_errors').html('').slideUp('slow');
			
			if ($('input#opc_id_customer').val() == 0)
			{
				var callingFile = authenticationUrl;
				var params = 'submitAccount=true&';
			}
			else
			{
				var callingFile = orderOpcUrl;
				var params = 'method=editCustomer&';
			}
			
			$('#opc_account_form input:visible').each(function() {
				if ($(this).is('input[type=checkbox]'))
				{
					if ($(this).is(':checked'))
						params += encodeURI($(this).attr('name'))+'=1&';
				}
				else if ($(this).is('input[type=radio]'))
				{
					if ($(this).is(':checked'))
						params += encodeURI($(this).attr('name'))+'='+encodeURI($(this).val())+'&';
				}
				else
					params += encodeURI($(this).attr('name'))+'='+encodeURI($(this).val())+'&';
			});
			$('#opc_account_form select:visible').each(function() {
				params += encodeURI($(this).attr('name'))+'='+encodeURI($(this).val())+'&';
			});
			params += 'customer_lastname='+encodeURI($('#customer_lastname').val())+'&';
			params += 'customer_firstname='+encodeURI($('#customer_firstname').val())+'&';
			params += 'alias='+encodeURI($('#alias').val())+'&';
			params += 'is_new_customer='+encodeURI($('#is_new_customer').val())+'&';
			// Clean the last &
			params = params.substr(0, params.length-1);

			$.ajax({
				type: 'POST',
				url: callingFile,
				async: false,
				cache: false,
				dataType : "json",
				data: 'ajax=true&'+params+'&token=' + static_token ,
				success: function(jsonData)
				{
					if (jsonData.hasError)
					{
						var tmp = '';
						var i = 0;
						for(error in jsonData.errors)
							//IE6 bug fix
							if(error != 'indexOf')
							{
								i = i+1;
								tmp += '<li>'+jsonData.errors[error]+'</li>';
							}
						tmp += '</ol>';
						var errors = '<b>'+txtThereis+' '+i+' '+txtErrors+':</b><ol>'+tmp;
						$('#opc_account_errors').html(errors).slideDown('slow');
					}

					isGuest = ($('#is_new_customer').val() == 1 ? 0 : 1);
					
					if (jsonData.id_customer != undefined && jsonData.id_customer != 0 && jsonData.isSaved)
					{
						// update token
						static_token = jsonData.token;
						
						// update addresses id
						$('input#opc_id_address_delivery').val(jsonData.id_address_delivery);
						$('input#opc_id_address_invoice').val(jsonData.id_address_invoice);
						
						// It's not a new customer
						if ($('input#opc_id_customer').val() != '0')
						{
							if (!saveAddress('delivery'))
								return false;
						}
						
						// update id_customer
						$('input#opc_id_customer').val(jsonData.id_customer);
						
						if ($('#invoice_address:checked').length != 0)
						{
							if (!saveAddress('invoice'))
								return false;
						}
						
						// update id_customer
						$('input#opc_id_customer').val(jsonData.id_customer);
						
						var html = '<div class="opc_float_status">';
						html += '<h4>'+txtDeliveryAddress+'</h4>';
						if ($('#company').val() != "")
							html += '<b>'+$('#company').val()+'</b><br />';
						html += '<b>'+$('#customer_firstname').val()+' '+$('#customer_lastname').val()+'</b><br />';
						html += $('#address1').val()+'<br />';
						html += $('#postcode').val()+' ';
						html += $('#city').val()+'<br />';
						html += $('#id_country option:selected').html()+'<br />';
						if ($('#id_state').is(':visible'))
							html += $('#id_state option:selected').html()+'<br />';
						html += '<div style="float: left; margin-top: 10px;"><a href="#opc_block_1" class="button_large opc_button" onclick="manageButtonsEvents($(this));return false;">'+txtModifyMyAddress+'</a></div>';
						html += '</div>';
						html += '<div class="opc_float_status">';
						html += '<h4>'+txtInvoiceAddress+'</h4>';
						if ($('#company'+($('#invoice_address').is(':checked') ? '_invoice' : '')).val() != "")
							html += '<b>'+$('#company'+($('#invoice_address').is(':checked') ? '_invoice' : '')).val()+'</b><br />';
						html += '<b>'+$('#customer_firstname').val()+' '+$('#customer_lastname').val()+'</b><br />';
						html += $('#address1'+($('#invoice_address').is(':checked') ? '_invoice' : '')).val()+'<br />';
						html += $('#postcode'+($('#invoice_address').is(':checked') ? '_invoice' : '')).val()+' ';
						html += $('#city'+($('#invoice_address').is(':checked') ? '_invoice' : '')).val()+'<br />';
						html += $('#id_country'+($('#invoice_address').is(':checked') ? '_invoice' : '')+' option:selected').html()+'<br />';
						if ($('#id_state'+($('#invoice_address').is(':checked') ? '_invoice' : '')).is(':visible'))
							html += $('#id_state'+($('#invoice_address').is(':checked') ? '_invoice' : '')+' option:selected').html()+'<br />';
						html += '</div>';
						html += '<div class="clear" style="font-size: 0px;"></div>';
						
						$('#opc_block_1_status').html(html);
						
						// force to refresh carrier list
						updateAddressesAndCarriersList();
						
						$('.opc_block_content:visible').slideUp('slow', function() {
							$((isVirtualCart == 1 ? '#opc_block_3' : '#opc_block_2')).slideDown('slow', function() {
								$('.opc_status').each(function() {
									if ($(this).attr('id') != $('.opc_block_content:visible').attr('id')+'_status')
										$(this).slideDown('slow');
									else
										$(this).slideUp('slow');
								});
							});
						});
					}
				},
				error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to save account \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
			});
			return false;
		});
	}

	// update status
	if (isLogged)
		updateAddressesStatus();
	updateCarrierStatus();
	updateTOSStatus();
	
	// Order message update
	$('#message').blur(function() {
		$.ajax({
           type: 'POST',
           url: orderOpcUrl,
           async: true,
           cache: false,
           dataType : "json",
           data: 'ajax=true&method=updateMessage&message=' + encodeURI($('#message').val()) + '&token=' + static_token ,
           success: function(jsonData)
           {
           		if (jsonData.hasError)
				{
					var errors = '';
					for(error in jsonData.errors)
						//IE6 bug fix
						if(error != 'indexOf')
							errors += jsonData.errors[error] + "\n";
					alert(errors);
				}
			},
           error: function(XMLHttpRequest, textStatus, errorThrown) {alert("TECHNICAL ERROR: unable to save message \n\nDetails:\nError thrown: " + XMLHttpRequest + "\n" + 'Text status: ' + textStatus);}
       });
	});
	
	// Gift message update
	$('#gift_message').blur(function() {
		updateCarrierSelectionAndGift();
	});
	
	// TOS
	$('#cgv').click(function() {
		if ($('#cgv:checked').length != 0)
			var checked = 1;
		else
			var checked = 0;
		
		$.ajax({
           type: 'POST',
           url: orderOpcUrl,
           async: true,
           cache: false,
           dataType : "json",
           data: 'ajax=true&method=updateTOSStatus&checked=' + checked + '&token=' + static_token,
           success: function(json)
           {
           		updateTOSStatus();
           }
       });
	});
	
});
