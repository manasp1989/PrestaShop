<?php

class Attachment extends ObjectModel
{
	public		$file;
	public		$name;
	public		$description;

	/** @var integer position */
	public		$position;

	protected	$fieldsRequired = array('file');
	protected	$fieldsSize = array('file' => 40);
	protected	$fieldsValidate = array('file' => 'isGenericName');

	protected	$fieldsRequiredLang = array('name');
	protected	$fieldsSizeLang = array('name' => 32);
	protected	$fieldsValidateLang = array('name' => 'isGenericName', 'description' => 'isCleanHtml');

	protected 	$table = 'attachment';
	protected 	$identifier = 'id_attachment';

	public function getFields()
	{
		parent::validateFields();
		$fields['file'] = pSQL($this->file);
		return $fields;
	}

	public function getTranslationsFieldsChild()
	{
		parent::validateFieldsLang();
		return parent::getTranslationsFields(array('name', 'description'));
	}
	
	public function delete()
	{
		Db::getInstance()->Execute('DELETE FROM '._DB_PREFIX_.'product_attachment WHERE id_attachment = '.intval($this->id));
		return parent::delete();
	}
	
	public static function getAttachments($id_lang, $id_product, $include = true)
	{
		return Db::getInstance()->ExecuteS('
		SELECT *
		FROM '._DB_PREFIX_.'attachment a
		LEFT JOIN '._DB_PREFIX_.'attachment_lang al ON (a.id_attachment = al.id_attachment AND al.id_lang = '.intval($id_lang).')
		WHERE a.id_attachment '.($include ? 'IN' : 'NOT IN').' (SELECT pa.id_attachment FROM '._DB_PREFIX_.'product_attachment pa WHERE id_product = '.intval($id_product).')');
	}
	
	public static function attachToProduct($id_product, $array)
	{
		$result1 = Db::getInstance()->Execute('DELETE FROM '._DB_PREFIX_.'product_attachment WHERE id_product = '.intval($id_product));
		if (is_array($array))
		{
			$ids = array();
			foreach ($array as $id_attachment)
				$ids[] = '('.intval($id_product).','.intval($id_attachment).')';
			return $result1 & Db::getInstance()->Execute('INSERT INTO '._DB_PREFIX_.'product_attachment (id_product, id_attachment) VALUES '.implode(',',$ids));
		}
		return $result1;
	}
}

?>