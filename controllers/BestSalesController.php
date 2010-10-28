<?php

class BestSalesControllerCore extends FrontController
{
	public function preProcess()
	{
		include(dirname(__FILE__).'/../product-sort.php');
		
		$nbProducts = intval(ProductSale::getNbSales());
		
		include(dirname(__FILE__).'/../pagination.php');
		
		global $orderBy, $orderWay, $p, $n;
		$this->smarty->assign(array(
			'products' => ProductSale::getBestSales(intval($this->cookie->id_lang), intval($p) - 1, intval($n), $orderBy, $orderWay),
			'add_prod_display' => Configuration::get('PS_ATTRIBUTE_CATEGORY_DISPLAY'),
			'nbProducts' => $nbProducts)
		);
	}

	public function setMedia()
	{
		parent::setMedia();
		Tools::addCSS(_THEME_CSS_DIR_.'product_list.css');
	}
	
	public function displayContent()
	{
		parent::displayContent();
		$this->smarty->display(_PS_THEME_DIR_.'best-sales.tpl');
	}
}