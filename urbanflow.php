<?php
require_once('./cg-config.php');
	require_once( CGROOTPATH . 'php/cg-session.php' );
	require_once( CGROOTPATH . 'php/cg-acl.php' );
	require_once( CGROOTPATH . 'php/cg-user.php' ); 

	cg_user_session_start();
	$authuser = cg_user_session_auth();

	$cg_page_name = 'urbanflow'; 
	$appname = 'urbanflow'; 
	include_once( CGROOTPATH . 'portal/page-loader.php' ); // render the page
?>
