# Wait Watcher

Turns out, trying to buy fitness equipment during a pandemic is like trying to find a tissue during the end of Toy Story 3- It's impossible. The demand is just too high.

Fitness companies are doing their best to keep equipment in stock, but supply is snatched up in minutes. Also, as I've found out, shipping thousands of pounds ain't cheap. So being able to order as many items at once is vital in preventing me from weeping about shipping costs.

This all led to the Wait Watcher! The app that'll check any webpage every 5mins and alert you (via email or SMS) when a custom set of criteria is met.

## To Install

Download dependencies :

```
npm install
```
Then run with:
```
npm run start
```

NOTE: Adding `NODE_ENV=production` to your start script will use the production mongoDB, and will actually send SMS messages.

## To Use

- Create a page.
    - Provide a name and URL.
    - You'll also need some text/elements to check against.
        - Provide a name, and an class/element/id identifier (for more info, check [cheerio.js](https://cheerio.js.org/) ).
        - Texts will take the actual string at the selected identifier.
        - Elements will count the number of elements returned from the given identifier. 
```
{
	"url":  "https://www.ironmaster.com/products/quick-lock-adjustable-dumbbells-75/",
	"name":  "IronMaster Dumbbells",
	"texts":  [
	{
		"name":  "Out of Stock Popup",
		"identifier":  ".woocommerce-error"
	}],
	"elements":  [
	{
		"name":  "Add To Cart Form",
		"identifier":  ".cart"
	}],
}
```
- To ensure your page is correctly being scraped, you can post to `/api/page-scrapes` to make sure the correct information is being returned.
 - Create an Alert.
	 - Provide an Alert name, email address, and (optionally) a phone number to receive texts.
	 - Each Alert contains a`pageCriteria` array, which is the criteria to validate for each specified page.
		 - `pageCriteria.content` is an array of the pages elements/texts. The criteria can be `equals`/`includes`/`greater than`/`less than`.  `value` is the desired value for the criteria to be true.
		 - `andOr` is whether all or one of the content criteria needs to be true for that page's criteria to be true. 
		 - If a `pageCriteria` contains no `content` array, it will be true if there are any changes to that page.
 ```
 {
	"name":  "My Fitness Setup",
	"emailAddress":  "YourEmail@email.com",
	"phoneNumber":  "15558675309",
	"pageCriteria":  [
		{
			"content":  [
				{
				"name":  "Add To Cart Button",
				"criteria":  "greater than",
				"value":  0
				}
			],
			"page":  "5ed9d2ab11307b25e6361f5d",
			"andOr":  "OR"
		},
		{
			"page":  "5ed9c5a8d810d2e9654dc855"
		}
	]
}
 ```