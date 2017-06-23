---
title: TheCN Developer
---

# TheCN JavaScript SDK
TheCN's JavaScript SDK is a convienent way to enable theCN integrations within your websites and web-based applications, without the need for any back-end programming. 

## Getting Started with the JavaScript SDK

### Step1 - Initialize the SDK in your webpage
In order to use any of the functionality available in the SDK, you simply need to include a short piece of JavaScript in your HTML that will async load the SDK into your pages.

```
(function(g, n) {
    window['CNSDKObject'] = n;
    window[n] = window[n] || function() {
        (window[n].q = window[n].q ||[]).push(arguments);
    };
    var s = document.createElement('script');
    s.type = 'text/javascript';
    s.src = g;
    var x = document.getElementsByTagName('script')[0];
    x.parentNode.insertBefore(s, x);
})('https://v4-sso.thecn.com/js/sdk/cn.js?v1.0.0', 'CNSDK');

CNSDK('init', 'your-app-id');
```

This code will load and initialize the SDK. You must replace the value in your-app-id with the ID of your own CN application.

### Step2 - Create a "Sign In With theCN" button

Generate a button in your HTML and specified event `click` handler function.


{% highlight html %}
<a href="javascript:;" onclick="signInByCN();">Sign In With CN</a>
{% endhighlight %}

### Step3 - Handle authentication & retrieve basic member data
You can request additional privileges by requiring the user to authorize with method `CNSDK('authorize', function(){...}`. It will present a popup authorization window. If the user authorizes successfully, it will execute the handler `onSuccessAuthorized`.

![authorization window](/assets/authorize.png)

Within the handler function, it's safe to use the SDK's generic API call wrapper, `SDK('api')`, to make a rest API call to fetch the member's basic profile data, completing the Sign In with theCN process.


{% highlight javascript %}
CNSDK('authorize', function() {
      CNSDK('api').get('me')
            .result(function(status, data){
                console.log(status, data);
                //200, {id: 'xxx', first_name: 'yyy', ...}
                //complete your process
            })
            .error(function(status, statusText){
                //throw any error
            });
});
{% endhighlight %}







