#i18n-client

i18n-client is a client library for i18ngo.

##Getting started

###Configuration

	define(['jquery', 'i18n'], function(){
		i18n.init({api: 'http://localhost:8080'});
	});

###Template

	//Use as attribute
	<div id="search">
		<a i18n-bind="header, search">Search</a>
	</div>

	//Inner text will be param source until it was omitted.
	<div id="search">
		<a i18n-bind="header">Search</a>
	</div>

	<script>
		$('#search').html(i18n.compile($('#search').html()));
	</script>

###With Template engine (ex. doT.js)

	<div>{{=i18n.t('header', 'search')}}</div> //with doT.js

###Change language

	<script>
		i18n.init({lang: 'cn_ZH'}, function(){
			//Reload the page with router
			Router.go(location.pathname + location.search);
		});
	</script>
