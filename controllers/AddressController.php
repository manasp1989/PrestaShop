<?php

class AddressControllerCore extends FrontController
{
	public function preProcess()
	{
		parent::preProcess();
		
		if ($back = Tools::getValue('back'))
			$this->smarty->assign('back', Tools::safeOutput($back));
		if ($mod = Tools::getValue('mod'))
			$this->smarty->assign('mod', Tools::safeOutput($mod));
			
		if ($id_address = intval(Tools::getValue('id_address')))
		{
			$address = new Address(intval($id_address));
			if (Validate::isLoadedObject($address) AND Customer::customerHasAddress(intval($this->cookie->id_customer), intval($id_address)))
			{
				if (Tools::isSubmit('delete'))
				{
					if ($cart->id_address_invoice == $address->id)
						unset($cart->id_address_invoice);
					if ($cart->id_address_delivery == $address->id)
						unset($cart->id_address_delivery);
					if ($address->delete())
						Tools::redirect('addresses.php');
					$this->errors[] = Tools::displayError('this address cannot be deleted');
				}
				$this->smarty->assign(array(
					'address' => $address,
					'id_address' => intval($id_address)
				));
			}
			else
				Tools::redirect('addresses.php');
		}
		if (Tools::isSubmit('submitAddress'))
		{
			$address = new Address();
			$this->errors = $address->validateControler();
			$address->id_customer = intval($this->cookie->id_customer);

			if (!Tools::getValue('phone') AND !Tools::getValue('phone_mobile'))
				$this->errors[] = Tools::displayError('You must register at least one phone number');
			if (!$country = new Country(intval($address->id_country)) OR !Validate::isLoadedObject($country))
				die(Tools::displayError());
			$zip_code_format = $country->zip_code_format;
			if ($country->need_zip_code)
			{
				if (($postcode = Tools::getValue('postcode')) AND $zip_code_format)
				{
					$zip_regexp = '/^'.$zip_code_format.'$/ui';
					$zip_regexp = str_replace('N', '[0-9]', $zip_regexp);
					$zip_regexp = str_replace('L', '[a-zA-Z]', $zip_regexp);
					$zip_regexp = str_replace('C', $country->iso_code, $zip_regexp);
					if (!preg_match($zip_regexp, $postcode))
						$this->errors[] = Tools::displayError('Your postal code/zip code is incorrect.');
				}
				elseif ($zip_code_format)
					$this->errors[] = Tools::displayError('postcode is required.');
				elseif ($postcode AND !preg_match('/^[0-9a-zA-Z -]{4,9}$/ui', $postcode))
					$this->errors[] = Tools::displayError('Your postal code/zip code is incorrect.');
			}
			if (Configuration::get('PS_TOKEN_ENABLE') == 1 AND
				strcmp(Tools::getToken(false), Tools::getValue('token')) AND
				$this->cookie->isLogged() === true)
				$this->errors[] = Tools::displayError('invalid token');

			if (intval($country->contains_states) AND !intval($address->id_state))
				$this->errors[] = Tools::displayError('this country require a state selection');

			if (!sizeof($this->errors))
			{
				if (isset($id_address))
				{
					$country = new Country(intval($address->id_country));
					if (Validate::isLoadedObject($country) AND !$country->contains_states)
						$address->id_state = 0;
					$address_old = new Address(intval($id_address));
					if (Validate::isLoadedObject($address_old) AND Customer::customerHasAddress(intval($this->cookie->id_customer), intval($address_old->id)))
					{
						if ($cart->id_address_invoice == $address_old->id)
							unset($cart->id_address_invoice);
						if ($cart->id_address_delivery == $address_old->id)
							unset($cart->id_address_delivery);

						if ($address_old->isUsed())
							$address_old->delete();
						else
						{
							$address->id = intval($address_old->id);
							$address->date_add = $address_old->date_add;
						}
					}
				}
				
				if ($result = $address->save())
				{
					if ((bool)(Tools::getValue('select_address', false)) == true)
					{
						/* This new adress is for invoice_adress, select it */
						$cart->id_address_invoice = intval($address->id);
						$cart->update();
					}
					Tools::redirect($back ? ($mod ? $back.'&back='.$mod : $back) : 'addresses.php');
				}
				$this->errors[] = Tools::displayError('an error occurred while updating your address');
			}
		}
		elseif (!$id_address)
		{
			$customer = new Customer(intval($this->cookie->id_customer));
			if (Validate::isLoadedObject($customer))
			{
				$_POST['firstname'] = $customer->firstname;
				$_POST['lastname'] = $customer->lastname;
			}
		}
		
	}
	
	public function setMedia()
	{
		parent::setMedia();
		Tools::addJS(_THEME_JS_DIR_.'tools/statesManagement.js');
	}
	
	public function process()
	{
		parent::process();

		if (Tools::isSubmit('id_country') AND Tools::getValue('id_country') != NULL AND is_numeric(Tools::getValue('id_country')))
			$selectedCountry = intval(Tools::getValue('id_country'));
		elseif (isset($address) AND isset($address->id_country) AND !empty($address->id_country) AND is_numeric($address->id_country))
			$selectedCountry = intval($address->id_country);
		elseif (isset($_SERVER['HTTP_ACCEPT_LANGUAGE']))
		{
			$array = preg_split('/,|-/', $_SERVER['HTTP_ACCEPT_LANGUAGE']);
			if (!Validate::isLanguageIsoCode($array[0]) OR !($selectedCountry = Country::getByIso($array[0])))
				$selectedCountry = intval(Configuration::get('PS_COUNTRY_DEFAULT'));
		}
		else
			$selectedCountry = intval(Configuration::get('PS_COUNTRY_DEFAULT'));

		$countries = Country::getCountries(intval($this->cookie->id_lang), true);
		$countriesList = '';
		foreach ($countries AS $country)
			$countriesList .= '<option value="'.intval($country['id_country']).'" '.($country['id_country'] == $selectedCountry ? 'selected="selected"' : '').'>'.htmlentities($country['name'], ENT_COMPAT, 'UTF-8').'</option>';

		$this->smarty->assign(array(
			'countries_list' => $countriesList,
			'countries' => $countries,
			'errors' => $this->errors,
			'token' => Tools::getToken(false),
			'select_address' => intval(Tools::getValue('select_address'))
		));
	}
	
	public function displayContent()
	{
		parent::displayContent();
		$this->smarty->display(_PS_THEME_DIR_.'address.tpl');
	}
}