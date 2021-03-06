{*
* 2007-2012 PrestaShop
*
* NOTICE OF LICENSE
*
* This source file is subject to the Academic Free License (AFL 3.0)
* that is bundled with this package in the file LICENSE.txt.
* It is also available through the world-wide-web at this URL:
* http://opensource.org/licenses/afl-3.0.php
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
*  @copyright  2007-2012 PrestaShop SA
*  @version  Release: $Revision: 14430 $
*  @license    http://opensource.org/licenses/afl-3.0.php  Academic Free License (AFL 3.0)
*  International Registered Trademark & Property of PrestaShop SA
*}

{include file="$tpl_dir./header-page.tpl"}

{if $opc}
	{assign var="back_order_page" value="order-opc.php"}
{else}
	{assign var="back_order_page" value="order.php"}
{/if}

{*
** Retro compatibility for PrestaShop version < 1.4.2.5 with a recent theme
** Syntax smarty for v2
*}

{* Will be deleted for 1.5 version and more *}
{if !isset($formatedAddressFieldsValuesList)}
	{$ignoreList.0 = "id_address"}
	{$ignoreList.1 = "id_country"}
	{$ignoreList.2 = "id_state"}
	{$ignoreList.3 = "id_customer"}
	{$ignoreList.4 = "id_manufacturer"}
	{$ignoreList.5 = "id_supplier"}
	{$ignoreList.6 = "date_add"}
	{$ignoreList.7 = "date_upd"}
	{$ignoreList.8 = "active"}
	{$ignoreList.9 = "deleted"}	
	
	{* PrestaShop 1.4.0.17 compatibility *}
	{if isset($addresses)}
		{foreach from=$addresses key=k item=address}
			{counter start=0 skip=1 assign=address_key_number}
			{$id_address = $address.id_address}
			{foreach from=$address key=address_key item=address_content}
				{if !in_array($address_key, $ignoreList)}
					{$formatedAddressFieldsValuesList.$id_address.ordered_fields.$address_key_number = $address_key}
					{$formatedAddressFieldsValuesList.$id_address.formated_fields_values.$address_key = $address_content}
					{counter}
				{/if}
			{/foreach}
		{/foreach}
	{/if}
{/if}

<script type="text/javascript">
// <![CDATA[
	{if !$opc}
	var orderProcess = 'order';
	var currencySign = '{$currencySign|html_entity_decode:2:"UTF-8"}';
	var currencyRate = '{$currencyRate|floatval}';
	var currencyFormat = '{$currencyFormat|intval}';
	var currencyBlank = '{$currencyBlank|intval}';
	var txtProduct = "{l s='product'}";
	var txtProducts = "{l s='products'}";
	{/if}

	var formatedAddressFieldsValuesList = new Array();

	{foreach from=$formatedAddressFieldsValuesList key=id_address item=type}
		formatedAddressFieldsValuesList[{$id_address}] =
		{ldelim}
			'ordered_fields':[
				{foreach from=$type.ordered_fields key=num_field item=field_name name=inv_loop}
					{if !$smarty.foreach.inv_loop.first},{/if}"{$field_name}"
				{/foreach}
			],
			'formated_fields_values':{ldelim}
					{foreach from=$type.formated_fields_values key=pattern_name item=field_name name=inv_loop}
						{if !$smarty.foreach.inv_loop.first},{/if}"{$pattern_name}":"{$field_name|escape:'htmlall':'UTF-8'}"
					{/foreach}
				{rdelim}
		{rdelim}
	{/foreach}

	function buildAddressBlock(id_address, address_type, dest_comp)
	{ldelim}
		var li_content = formatedAddressFieldsValuesList[id_address]['formated_fields_values'];
		var ordered_fields_name = ['title'];

		ordered_fields_name = ordered_fields_name.concat(formatedAddressFieldsValuesList[id_address]['ordered_fields']);
		ordered_fields_name = ordered_fields_name.concat(['update']);
		
		dest_comp.html('');
		
		li_content['update'] = '<a data-role="button" data-corners="true" data-shadow="true" data-iconshadow="true" data-wrapperels="span" data-theme="c" class="ui-mini ui-btn ui-shadow ui-btn-corner-all ui-btn-up-c" href="{$link->getPageLink('address.php', true)}?id_address='+id_address+'&amp;back={$back_order_page}?step=1{if $back}&mod={$back}{/if}" title="{l s='Modify'}"><span class="ui-btn-inner ui-btn-corner-all"><span class="ui-btn-text">{l s='Modify'}</span></span></a>';

		appendAddressList(dest_comp, li_content, ordered_fields_name);
	{rdelim}

	function appendAddressList(dest_comp, values, fields_name)
	{ldelim}
		for (var item in fields_name)
		{ldelim}
			var name = fields_name[item];
			var value = getFieldValue(name, values);
			if (value != "")
			{ldelim}
				var new_li = document.createElement('span');
				new_li.className = 'address_'+ name;
				new_li.innerHTML = getFieldValue(name, values);
				dest_comp.append(new_li);
			{rdelim}
		{rdelim}
	{rdelim}

	function getFieldValue(field_name, values)
	{ldelim}
		var reg=new RegExp("[ ]+", "g");

		var items = field_name.split(reg);
		var vals = new Array();

		for (var field_item in items)
			vals.push(values[items[field_item]]);
		return vals.join(" ");
	{rdelim}
//]]>
</script>

{if $opc}<h2>1. {l s='Addresses'}</h2>{/if}

{if !$opc}
{assign var='current_step' value='address'}
{include file="$tpl_dir./order-steps.tpl"}
{include file="$tpl_dir./errors.tpl"}
<form action="{$link->getPageLink($back_order_page, true)}" method="post">
{else}
<div id="opc_account" class="opc-main-block">
	<div id="opc_account-overlay" class="opc-overlay" style="display:none;"></div>
{/if}
	<div class="addresses">
		<p class="address_delivery select">
			<label for="id_address_delivery">{l s='Choose a delivery address:'}</label>
			<select name="id_address_delivery" id="id_address_delivery" class="address_select" onchange="updateAddressesDisplay();{if $opc}updateAddressSelection();{/if}">

			{foreach from=$addresses key=k item=address}
				<option value="{$address.id_address|intval}" {if $address.id_address == $cart->id_address_delivery}selected="selected"{/if}>{$address.alias|escape:'htmlall':'UTF-8'}</option>
			{/foreach}
			
			</select>
		</p>
		<p class="checkbox" {if $cart->isVirtualCart()}style="display:none;"{/if}>
			<input type="checkbox" name="same" id="addressesAreEquals" value="1" onclick="updateAddressesDisplay();{if $opc}updateAddressSelection();{/if}" {if $cart->id_address_invoice == $cart->id_address_delivery || $addresses|@count == 1}checked="checked"{/if} />
			<label for="addressesAreEquals">{l s='Use the same address for billing.'}</label>
		</p>
		
		<p id="address_invoice_form" class="select" {if $cart->id_address_invoice == $cart->id_address_delivery}style="display: none;"{/if}>
		
		{if $addresses|@count > 1}
			<label for="id_address_invoice" class="strong">{l s='Choose a billing address:'}</label>
			<select name="id_address_invoice" id="id_address_invoice" class="address_select" onchange="updateAddressesDisplay();{if $opc}updateAddressSelection();{/if}">
			{section loop=$addresses step=-1 name=address}
				<option value="{$addresses[address].id_address|intval}" {if $addresses[address].id_address == $cart->id_address_invoice && $cart->id_address_delivery != $cart->id_address_invoice}selected="selected"{/if}>{$addresses[address].alias|escape:'htmlall':'UTF-8'}</option>
			{/section}
			</select>
			{else}
				<a style="margin-left: 221px;" href="{$link->getPageLink('address.php', true)}?back={$back_order_page}?step=1&select_address=1{if $back}&mod={$back}{/if}" title="{l s='Add'}" class="button_large">{l s='Add a new address'}</a>
			{/if}
		</p>
		<div class="clear"></div>
		
		<ul data-role="listview" class="address_list" data-inset="true" data-dividertheme="{$ps_mobile_styles.PS_MOBILE_THEME_LIST_HEADERS}">
			<li data-role="list-divider">{l s='Delivery Address'}</li>
			<li>
				<div class="address item" id="address_delivery" style="list-style-type: none;{if $cart->isVirtualCart()} display: none;{/if}"></div>
			</li>
		</ul>
		<ul data-role="listview" class="address_list" data-inset="true" data-dividertheme="{$ps_mobile_styles.PS_MOBILE_THEME_LIST_HEADERS}">
			<li data-role="list-divider">{l s='Billing Address'}</li>
			<li>
				<div class="address alternate_item {if $cart->isVirtualCart()}full_width{/if}" style="list-style-type: none;" id="address_invoice"></div>
			</li>
		</ul>
		<a data-role="button" data-shadow="false" style="text-align: left; border-radius: 0.6em!important;" href="{$link->getPageLink('address.php', true)}?back={$back_order_page}?step=1{if $back}&mod={$back}{/if}" data-icon="cross" data-iconpos="left">{l s='Add a new Address'}</a>
		{if !$opc}
		<div data-role="collapsible" data-theme="c" data-content-theme="c">
			<h3 style="margin: 0;">{l s='Add a Comment'}</h3>
			<div id="ordermsg" style="margin: 0;">
				<p>{l s='If you would like to add a comment about your order, please write it below.'}</p>
				<p class="textarea"><textarea cols="60" rows="3" name="message">{if isset($oldMessage)}{$oldMessage}{/if}</textarea></p>
			</div>
		</div>
		{/if}
	</div>
{if !$opc}
	<p class="cart_navigation submit" style="text-align: center; margin-top: 10px;">
		<input type="hidden" class="hidden" name="step" value="2" />
		<input type="hidden" name="back" value="{$back}" />
		<a data-role="button" data-icon="back" data-posicon="left" data-mini="true" data-inline="true" href="{$link->getPageLink($back_order_page, true)}?step=0{if $back}&back={$back}{/if}" title="{l s='Previous'}" class="button">{l s='Previous'}</a>
		<input type="submit" name="processAddress" value="{l s='Next step'}" data-icon="check" data-mini="true" data-iconpos="right" data-theme="{$ps_mobile_styles.PS_MOBILE_THEME_BUTTONS}" data-inline="true" class="exclusive" />
	</p>
</form>
{else}
</div>
{/if}

{include file="$tpl_dir./footer-page.tpl"}