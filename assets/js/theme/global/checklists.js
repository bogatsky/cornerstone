import utils from '@bigcommerce/stencil-utils';
import { hooks, api } from '@bigcommerce/stencil-utils';
import ProductDetails from '../common/product-details';
//import datepicker from 'js-datepicker';

export default function (context) {
    
	console.log(context);
	var customer_id = context.customer_id;	
		
	//get query string vals
	
	function getUrlParameter(name) {
	    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
	    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
	    var results = regex.exec(location.search);
	    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
		//console.log(results);
	};
	
	var inboundChecklist = getUrlParameter('checklist_id');
	console.log(inboundChecklist);
	
	if(inboundChecklist) {
		localStorage.setItem('currentChecklist', inboundChecklist );
	}
	
	
	//var customer_id = 2;
	var userUrl = 'https://esbtestbigcomm.azurewebsites.net/api/users?platformId='+customer_id;
	var checklistBin = new Bin('checklistBin');
    var productDetailsBin = new Bin('productDetailsBin');
    
	var userObj = {};
	var customerRole;
	var customerStudio;
	var customerStudioName;
	var checklistsUrl; 
	var prodsObj = {};
	var prods = {};
	var productDetailsData = {};
    var checklistProductData = {};
    var checklists;
    var obj = {};
	var obj2 = {};
	var lists = {};  	
	var productData = {};
	var localSelected;
	var selectedList = localStorage.getItem('currentChecklist');
	console.log(selectedList);
	
	var sourceOfTruth;
    var checklistapp;
    var mrProductsUrl = 'https://esbtestbigcomm.azurewebsites.net/api/Products';
    
	if (typeof customer_id !== 'undefined') {
	
		//get user info
		fetch(userUrl)
			.then(res => res.json())
			.then(data => userObj = data)
			.then(function() {
		  	
			  	//what'd we get
			  	console.log(userObj);
			  	customerRole = userObj.role;
			  	customerStudio = userObj.userStudios[0].studio.id;
			  	customerStudioName = userObj.userStudios[0].studio.name;
			  	//console.log(customerStudio);
			  	checklistsUrl = 'https://esbtestbigcomm.azurewebsites.net/api/studios/'+customerStudio+'/checklists';
			  //	console.log(checklistsUrl);
			    //loadChecklist();
			  	//console.log(customerStudioName);
			  	$('#studio-id').html(customerStudio+ ' ' + customerStudioName);
			  	
			 
			  	// get MR products
			}).then(function() {
				
				
					
			fetch(mrProductsUrl)
				.then(res => res.json())
				.then(data => prodsObj = data)
				.then(function() {
			  	
				  	//what'd we get
				  	console.log(prodsObj);
				  	
					var i = 0;
					var l = Object.keys(prodsObj).length;
					console.log(l);
					for (i; i < l; i++)  {
						//console.log(prodsObj[i].id);
						var prodId = prodsObj[i].platformId;
						prods[prodId] = prodsObj[i];
					}
					
				})
				.then(function() {
					console.log(prods);
					// get additional product data from BC
					
					var promises = [];
				    for (var key in prods) {
						promises.push(getProductData(key));
						console.log(key);
					}
					/*
					$.when.apply(null, promises).done(function() {
						console.log('blaow!!');
						//loadChecklist();
					})
					*/
					
					Promise.all(promises)
					.then(responseList => {
						
					   //debugger;
					   	
					   //console.dir(responseList);
					   //console.log('blaow!!');
					   //console.log(productDetailsData);
					   loadChecklist();
					   //var pdd = productDetailsBin.get();
					   //console.log(pdd);
					  
					});
					
					// WOULD BE NICE TO DO SOMETHING AFTER THE LOOP COMPLETES WITHH THE DATA
					
					
				})
				.then(function() {
					 
					 
					 
				});
						
						
			});
		
		
		
	

	
	
	function getProductData(productId) {
		var productPromise = new Promise(function(resolve, reject) {
			utils.api.product.getById(productId, { template: 'products/checklist-data' },  (err, response) => { 
			    productData = JSON.parse(response);
			   //  debugger;
		   		productDetailsData[productId] = productData;
		   		//console.log(productDetailsData);
		   		resolve(productId);
		   	});
		});
		return productPromise;	
		 	
	}
	
	function findObjectByKey(array, key, value) {
	    for (var i = 0; i < array.length; i++) {
	        if (array[i][key] === value) {
	            return array[i];
	        }
	    }
	    return null;
	}
	
	function findObjectIndexByKey(array, key, value) {
		for (var i = 0; i < array.length; i++) {
			if (array[i][key] === value) {
			    return i;
			}
		}
		return null;
	}
	
	
  
   
    function loadChecklist() {
       //  debugger;
        
		// pull checklist from remote url
		fetch(checklistsUrl)
		  .then(res => res.json())
		  .then(data => obj = data)
		  .then(function() {
		  	
		  	//what'd we get
		  	console.log(obj);
		  	
		  	//get array of checklist keys for selector list
		  	lists = obj;
		  	
		  	checklistBin.set(lists);
		  	
		  	if(!lists[selectedList]) {
			  	selectedList = lists[0].id;
			}
			
			if(inboundChecklist) { 
				console.log(inboundChecklist);
				var inbound = parseInt(inboundChecklist, 10);
			  	var checklistId = findObjectIndexByKey(lists, 'id', inbound);
			  	
			  	localSelected = checklistId;
			  	console.log(localSelected);
			  	localStorage.setItem('currentLocal', localSelected);
			} 
			
		  
		  	
		  	// no inbound list so check for local storage list also used for refresh
		  	if(!localSelected) {
			   localSelected = localStorage.getItem('currentLocal');
		  	}
		  	
		  	if(!localSelected) {
			   localSelected = 0;
		  	}
		    
		    //return true;	
		  
		  })
		  .then(function() {
			  
			  
		    //console.log(productDetailsBin.get());
		  	// reef instance to store shared data
		  	sourceOfTruth = new Reef(null, {
				data: {
					customer: customer_id,
					role: customerRole,
					checklists: checklistBin.get(),
					current: selectedList,
					currentLocal: localSelected,
					checklistProductData:productDetailsData
				},
				lagoon: true
			});
		  	
			//what's in the data store
		  	console.log(sourceOfTruth.data);
		    
		     
		  	
		  	//parent component
	    	checklistapp = new Reef('#checklist_app', {
				data: sourceOfTruth.data,
				template: function (props) {
					
					var buttons1 = '<div id="manager-controls"><button class="button button--primary">Submit for Approval</button></div>';
					var buttons2 = '<div id="manager-controls"><button class="button button--primary">Place Order</button></div>';
					
					console.log(props.checklists[localSelected]);
					
					var checklistOrderDate = new Date(props.checklists[localSelected].nextOrderDate).toISOString().split('T')[0];
					
					// productDetailsBin.set({productDetailsData});
					
					var html =
						'<div class="checklist-header">'+
						'<div id="checklistSelector"></div>'+
						'<div class="date-wrap"><label>Order Date: </label><br/><input type="date" id="checklistOrderDate" value="'+checklistOrderDate+'"/></div></div>' +
						'<h3>'+props.checklists[props.currentLocal].name+'</h3>' +
						'<div id="active-checklist"></div>';
						
					if(props.role == 'Manager') {
						html += buttons1;
					} else if (props.role == 'Owner') {
						html += buttons2;
					}
				
				return html;
			},
			attachTo: [sourceOfTruth]
		});
        
        //set up checklist selector from data
        var listSelector = new Reef('#checklistSelector', {
	        data: sourceOfTruth.data,
	        template: function (props) {
		       
		       
		       var html = '<label>Select Checklist</label><select id="checklistSelect">';
		        /* props.forEach(function (checklist) {
			       html += '<option value="'+checklist+'">Checklist '+ checklist +'</option>';
		       }); */
		       var i = 0;
		       //console.log(props.current);
		       for (i in props.checklists) {
			       //console.log(i);
			       if (i == props.currentLocal){
			       		html += '<option selected value="'+i+'">'+ props.checklists[i].name +'</option>';
			       } else {
				        html += '<option value="'+i+'">'+ props.checklists[i].name +'</option>';
			       }
		       }
		       
		       html += '</select>';	
		       return html;
	        },
	        attachTo: [sourceOfTruth, checklistapp] 
        });
        
        
       
        function getCart() {
       
	        fetch('/api/storefront/cart?include=lineItems.digitalItems.options,lineItems.physicalItems.options', {
			  credentials: 'same-origin'})
			  .then(function(response) {
			    return response.json();
			  })
			  .then(function(myJson) {
			    console.log(JSON.stringify(myJson));
			});
	    }
	    
		
		//show content of checklist selected
		var activelist = new Reef('#active-checklist', {
			data: sourceOfTruth.data,
			template: function (props) {
				var currentLocal = props.currentLocal;
				var currentList = props.current;
				//console.log(checklistProductData);
				
				var checklistProducts = props.checklists[currentLocal].products;
				//console.log(props);
				var html = '<table><thead><tr><th colspan="2">Item</th><th></th><th>Qty</th><th>Info</th></tr></thead><tbody>';
				
				var listKeys = Object.keys(checklistProducts), i = 0;
				var l = listKeys.length;
				for (i; i < l; i++) {
					
					console.log(checklistProducts);
					var productItem = checklistProducts[i];
					console.log(productDetailsData);
					
					
					var productPlatId = productItem.platformId.toString();
					//console.log(props);
					var productDetails = props.checklistProductData[productPlatId];
				    var productUrl = '';
					// debugger;
					
					if (typeof productDetailsData[productPlatId] === 'undefined') {
						productUrl = '#';	
				 	} else {
					 	productUrl = productDetailsData[productPlatId].url;
				 	}
					
					html += '<tr><td><img src="'+productItem.imageUrl+'"height="50" width="50" /></td><td>'+productItem.name +'<Br/><span class="list_price">$'+productItem.price+'</span><td></td><td><div>Cur: <span class="current">12</span></div><div>Rec: <span class="rec">12</span></div><div><input oninput="qtyChange('+productItem.id+',this.value)" type="number" name="qty" data-productid="'+productItem.id+'" id="product-item-qty-'+productItem.id+'" class="product-item-qty qty" value="'+productItem.quantity+'" min="0" max="99" /></div></td>'+'<td><a href="'+productUrl+'">Product Details</a><br/></td></tr>';
					html += '<tr class="checklist-row-save"><td colspan="5" align="center"><button data-qty="'+productItem.quantity+'" onclick="saveQty('+currentList+','+productItem.id+')" id="product-item-save'+productItem.id+'" class="button button--primary button--small hide">Save Updated Quantity</td></tr>';
					
				}
				
				if(listKeys.length == 0) {
					html += '<tr><td colspan="5">no products in checklist</td></tr>';
				}
				
				html += '</tbody></table>';
				return html;
				
				
			},
			attachTo: [sourceOfTruth, checklistapp]
			
		});
		
		
		// will render automatically when the app renders
		checklistapp.render();  
	
		var selector = document.getElementById('checklistSelect');
		
		selector.addEventListener("change", function(){
			var checklistId = lists[selector.value].id;
			productDetailsBin.set({productDetailsData});
			localStorage.setItem('currentChecklist', checklistId);
			localStorage.setItem('currentLocal', selector.value);
			sourceOfTruth.setData({
				currentLocal: selector.value,
				current: checklistId,
				checklistProductData: productDetailsData
			})
			//sourceOfTruth.setData({current: checklistId});
			//sourceOfTruth.setData({checklistProductData: productDetailsData});
			
			//getCart();
		
		});
		
	}); //end checklists call fetch	
  	 
  	
  	
  	  
	function addNewChecklist(customerStudio, checklistName) {
		console.log('lets add new checklist for '+customerId)
		var addChecklistUrl = 'https://esbtestbigcomm.azurewebsites.net/api/Checklists';
		var customerId = Number(customerId);
		
		fetch(addChecklistUrl, {
		    method: 'POST',
		    headers: {
				'Content-Type': 'application/json',
            },
			body: JSON.stringify({ "name": checklistName, "studioId": customerStudio, "nextOrderDate": "2019-06-30T14:47:37.631Z"})
	    })
	    .then(function(res){
		    return res.text();
		})
	    .then(function(text){
		    alert('checklist added', text);
		    checklistapp.render(); 
		    loadChecklist();
	   })
	    .catch(function(error) {
			log('Request failed', error);
			$('#cancelNewChecklist').click();
  		});
	}
     
    var checklistNewButton = document.getElementById('addNewChecklist'); 
    
    if(checklistNewButton != null) {
		console.log('checklistNewbuttonfound');
		checklistNewButton.addEventListener("click", function(e) {
			
			var checklistName = document.getElementById('checklist-name-field').value 
			console.log('lets add checklist '+checklistName);
			//var customerId = customerStudio;
			addNewChecklist(customerStudio,checklistName);
		});	
    }
    
    // new checklist form toggles
    
    $('#openNewChecklistUI').click(function(){
	   $('#newChecklistUI').toggle(); 
	   $('#openNewChecklistUI').hide();
    });
    
    $('#cancelNewChecklist').click(function(){
	    $('#newChecklistUI').toggle(); 
	    $('#openNewChecklistUI').show();
	});
	

    function addProductChecklist(checklistId, productId, qty) {
	    console.log('lets add'+productId);
	    productId = productId.toString();
	    var addProductUrl = 'https://esbtestbigcomm.azurewebsites.net/api/Checklists/'+checklistId+'/products';
	    fetch(addProductUrl, {
		    method: 'POST',
		    headers: {
				'Content-Type': 'application/json',
            },
			body: JSON.stringify({ "platformProductId": productId, "quantity": qty })
	    })
	    .then(function(res){
		    return res.text();
		 })
	    .then(function(text){
		    alert('product added to checklist', text);
		    loadChecklist();
		 })
	    .catch(function(error) {
			 log('Request failed', error);
			 $('#cancelNewChecklist').click();
  		});
	}
	
	var checklistAddButton = document.getElementById('addProductToChecklist');
	
	if(checklistAddButton != null) {
	    console.log('checklistbuttonfound');
		checklistAddButton.addEventListener("click", function(e) {
			// addProductChecklist(localStorage.getItem('currentChecklist'),this.dataset.productid);
			
			var checklists = checklistBin.get();
			var current = localStorage.getItem('currentChecklist');
			console.log(checklists);
			var checklistId = current;
			var studioId = Number(this.dataset.productid);
			var qty = document.getElementById('qty[]').value;
			
			console.log(checklistId, current, studioId, qty);
			
		    addProductChecklist(checklistId,studioId,qty);
		});	
    }
    
	
	} // end loadChecklist
	
	
    var backLink = document.getElementById('standaloneLink');
    if(backLink != null) {
	   backLink.addEventListener("click", function(e) { 
		   
		   var userList = localStorage.getItem('currentChecklist');
		   console.log('lets go back to dashboard user:'+customer_id+' checklist: '+ userList);
		   window.open('https://affectionate-bassi-0d6ca3.netlify.com/checklists/' + userList+'?user_id='+customer_id);
		   //window.open('https://affectionate-bassi-0d6ca3.netlify.com/checklists?user_id='+customer_id);
	   });
    }



	$('.addProductToChecklistCard').click(function() {
		var productId = $(this).attr('data-productid');
		addCardProductToChecklist(productId);
	});
	
	
	function addCardProductToChecklist(productId) {
	    console.log(productId);
	    console.log('lets add'+productId);
	    var checklistId = localStorage.getItem('currentChecklist');
	    console.log(checklistId);
	    var qty = "1";
	    
	    var addProductUrl = 'https://esbtestbigcomm.azurewebsites.net/api/Checklists/'+checklistId+'/products';
	    fetch(addProductUrl, {
		    method: 'POST',
		    headers: {
				'Content-Type': 'application/json',
            },
			body: JSON.stringify({ "platformProductId": productId, "quantity": "1" })
	    })
	    .then(function(res){
		    //console.log(res);
		     return res.text();
		 })
	    .then(function(text){
		    //console.log(res);
		     alert('product added to checklist', text);
		     //localStorage.setItem( 'currentChecklist', selector.value );
		     //checklistapp.render(); 
		     loadChecklist();
		     //$('#cancelNewChecklist').click();
	    })
	    .catch(function(error) {
			 console.log('Request failed', error);
			 //$('#cancelNewChecklist').click();
  		});

	    
    }	
		
		
}
    
} //end default function