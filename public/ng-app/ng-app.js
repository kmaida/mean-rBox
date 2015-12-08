angular.module("rBox",["ngRoute","ngResource","ngSanitize","ngMessages","mediaCheck","resize","satellizer","slugifier","ngFileUpload"]),function(){"use strict";var e={LOGINS:[{account:"google",name:"Google",url:"http://accounts.google.com"},{account:"twitter",name:"Twitter",url:"http://twitter.com"},{account:"facebook",name:"Facebook",url:"http://facebook.com"},{account:"github",name:"GitHub",url:"http://github.com"}]};angular.module("rBox").constant("OAUTH",e)}(),function(){"use strict";function e(e,t,n,i,r){function o(){p.pageTitle=e,t.$on("$routeChangeStart",l),t.$on("$routeChangeSuccess",g),t.$on("$routeChangeError",d)}function a(){t.$broadcast("enter-mobile")}function c(){t.$broadcast("exit-mobile")}function u(){t.$broadcast("loading-on")}function s(){t.$broadcast("loading-off")}function l(e,t,n){t.$$route&&t.$$route.resolve&&u()}function g(e,t,i){h.matchCurrent(n.SMALL),t.$$route&&t.$$route.resolve&&s()}function d(e,t,n,i){var o=t&&(t.title||t.name||t.loadedTemplateUrl)||"unknown target",a="Error routing to "+o+". "+(i.msg||"");f||(f=!0,s(),r.error(a))}var p=this,f=!1,h=i.init({scope:t,media:{mq:n.SMALL,enter:a,exit:c},debounce:200});o()}angular.module("rBox").controller("PageCtrl",e),e.$inject=["Page","$scope","MQ","mediaCheck","$log"]}(),function(){"use strict";function e(){function e(){return n+" | "+i}function t(e){i=e}var n="rBox",i="All Recipes";return{getTitle:e,setTitle:t}}angular.module("rBox").factory("Page",e)}(),function(){"use strict";function e(e){function t(t){var n=[];return angular.forEach(e.LOGINS,function(e){var i=e.account;t[i]&&n.push(i)}),n}return{getLinkedAccounts:t}}angular.module("rBox").factory("User",e),e.$inject=["OAUTH"]}(),function(){"use strict";function e(e){function t(){return e.isAuthenticated()}return{isAuthenticated:t}}angular.module("rBox").factory("Utils",e),e.$inject=["$auth"]}(),function(){"use strict";var e={LOGINURL:"http://localhost:8080/auth/login",CLIENT:{FB:"[your Facebook client ID]",GOOGLE:"[your Google client ID]",TWITTER:"/auth/twitter",GITHUB:"[your GitHub client ID]"}};angular.module("rBox").constant("OAUTHCLIENTS",e)}(),function(){"use strict";var e={LOGINURL:"http://rbox.kmaida.io/auth/login",CLIENT:{FB:"360173197505650",GOOGLE:"362136322942-k45h52q3uq56dc1gas1f52c0ulhg5190.apps.googleusercontent.com",TWITTER:"/auth/twitter",GITHUB:"9ff097299c86e524b10f"}};angular.module("rBox").constant("OAUTHCLIENTS",e)}(),function(){"use strict";function e(e,t){e.loginUrl=t.LOGINURL,e.facebook({clientId:t.CLIENT.FB}),e.google({clientId:t.CLIENT.GOOGLE}),e.twitter({url:t.CLIENT.TWITTER}),e.github({clientId:t.CLIENT.GITHUB})}function t(e,t,n){function i(i,r,o){r&&r.$$route&&r.$$route.secure&&!n.isAuthenticated()&&(e.authPath=t.path(),e.$evalAsync(function(){t.path("/login")}))}e.$on("$routeChangeStart",i)}angular.module("rBox").config(e).run(t),e.$inject=["$authProvider","OAUTHCLIENTS"],t.$inject=["$rootScope","$location","$auth"]}(),function(){"use strict";function e(e,t){e.when("/",{templateUrl:"ng-app/pages/home/Home.view.html",reloadOnSearch:!1,controller:"HomeCtrl",controllerAs:"home"}).when("/login",{templateUrl:"ng-app/pages/login/Login.view.html",controller:"LoginCtrl",controllerAs:"login"}).when("/recipe/:slug",{templateUrl:"ng-app/pages/recipe/Recipe.view.html",controller:"RecipeCtrl",controllerAs:"recipe"}).when("/recipes/author/:userId",{templateUrl:"ng-app/pages/recipes-archives/RecipesArchives.view.html",controller:"RecipesAuthorCtrl",controllerAs:"ra"}).when("/recipes/tag/:tag",{templateUrl:"ng-app/pages/recipes-archives/RecipesArchives.view.html",controller:"RecipesTagCtrl",controllerAs:"ra"}).when("/recipes/category/:category",{templateUrl:"ng-app/pages/recipes-archives/RecipesArchives.view.html",controller:"RecipesCategoryCtrl",controllerAs:"ra"}).when("/my-recipes",{templateUrl:"ng-app/pages/my-recipes/MyRecipes.view.html",secure:!0,reloadOnSearch:!1,controller:"MyRecipesCtrl",controllerAs:"myRecipes"}).when("/recipe/:slug/edit",{templateUrl:"ng-app/pages/recipe/EditRecipe.view.html",secure:!0,reloadOnSearch:!1,controller:"EditRecipeCtrl",controllerAs:"edit"}).when("/account",{templateUrl:"ng-app/pages/account/Account.view.html",secure:!0,reloadOnSearch:!1,controller:"AccountCtrl",controllerAs:"account"}).when("/admin",{templateUrl:"ng-app/pages/admin/Admin.view.html",secure:!0,controller:"AdminCtrl",controllerAs:"admin"}).otherwise({redirectTo:"/"}),t.html5Mode({enabled:!0}).hashPrefix("!")}angular.module("rBox").config(e),e.$inject=["$routeProvider","$locationProvider"]}(),function(){"use strict";function e(){function e(e){if(angular.isObject(e.data))return e.data;throw new Error("retrieved data is not typeof object.")}function t(e){throw new Error("Error retrieving data",e)}return{success:e,error:t}}angular.module("rBox").factory("Res",e)}(),function(){"use strict";function e(e,t){function n(n){return e.get("/api/recipe/"+n).then(t.success,t.error)}function i(n){return e.post("/api/recipe/new",n).then(t.success,t.error)}function r(t,n){return e.put("/api/recipe/"+t,n)}function o(t){return e["delete"]("/api/recipe/"+t)}function a(){return e.get("/api/recipes").then(t.success,t.error)}function c(){return e.get("/api/recipes/me").then(t.success,t.error)}function u(n){return e.get("/api/recipes/author/"+n).then(t.success,t.error)}function s(n){return e.put("/api/recipe/"+n+"/file").then(t.success,t.error)}function l(n){return e.post("/api/recipes/me/filed",n).then(t.success,t.error)}function g(t){return e.post("/api/recipe/clean-uploads",t)}return{getRecipe:n,createRecipe:i,updateRecipe:r,deleteRecipe:o,getPublicRecipes:a,getMyRecipes:c,getAuthorRecipes:u,fileRecipe:s,getFiledRecipes:l,cleanUploads:g}}angular.module("rBox").factory("recipeData",e),e.$inject=["$http","Res"]}(),function(){"use strict";function e(e,t){function n(n){return e.get("/api/user/"+n).then(t.success,t.error)}function i(){return e.get("/api/me").then(t.success,t.error)}function r(t){return e.put("/api/me",t)}function o(){return e.get("/api/users").then(t.success,t.error)}return{getAuthor:n,getUser:i,updateUser:r,getAllUsers:o}}angular.module("rBox").factory("userData",e),e.$inject=["$http","Res"]}(),function(){"use strict";function e(){function e(){var e,t="",n="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";for(e=0;5>e;e++)t+=n.charAt(Math.floor(Math.random()*n.length));return t}return{dietary:t,insertChar:n,categories:i,tags:r,generateId:e}}var t=["Gluten-free","Vegan","Vegetarian"],n=["⅛","¼","⅓","½","⅔","¾"],i=["Appetizer","Beverage","Dessert","Entree","Salad","Side","Soup"],r=["alcohol","baked","beef","fast","fish","low-calorie","one-pot","pasta","pork","poultry","slow-cook","stock","vegetable"];angular.module("rBox").factory("Recipe",e)}(),function(){"use strict";function e(e,n){function i(t,i,r,o){function a(){t.$on("enter-mobile",s),t.$on("exit-mobile",l)}function c(t,i,r,o){var a={id:n.generateId(),type:r};o&&(a.isHeading=!0),i.push(a),e(function(){var e=angular.element(t.target).parent("p").prev(".last").find("input").eq(0);e.click(),e.focus()})}function u(e,t){e.splice(t,1)}function s(){t.rfl.isLargeView=!1}function l(){t.rfl.isLargeView=!0}function g(t,n,i,r){var o=angular.element(t.target).closest("li");n.move(i,r),o.addClass("moved"),e(function(){o.removeClass("moved")},700)}t.rfl={},t.rfl.addItem=c,t.rfl.removeItem=u,t.rfl.moveItem=g,t.rfl.moveIngredients=!1,t.rfl.moveDirections=!1,a()}return{restrict:"EA",scope:{recipe:"=",userId:"@"},templateUrl:"ng-app/core/recipes/recipeForm.tpl.html",controller:t,controllerAs:"rf",bindToController:!0,link:i}}function t(e,t,n,i,r,o){function a(){B&&E.recipeData.tags.length&&angular.forEach(E.recipeData.tags,function(e,t){E.tagMap[e]=!0}),m()}function c(e,t,n){var i=e.createTextRange();e.setSelectionRange?(e.click(),e.focus(),e.setSelectionRange(t,n)):e.createTextRange&&(i.collapse(!0),i.moveEnd("character",n),i.moveStart("character",t),i.select())}function u(e,t){c(e,t,t)}function s(e,t){r(function(){C=t,y=angular.element("#"+e.target.id),U=y[0].selectionStart})}function l(e){var t;y&&(t=angular.isUndefined(E.recipeData.ingredients[C].amt)?"":E.recipeData.ingredients[C].amt,E.recipeData.ingredients[C].amt=t.substring(0,U)+e+t.substring(U),r(function(){U+=1,u(y[0],U)}))}function g(){C=null,y=null,U=null}function d(e){e&&e.length&&(e[0].size>3e5?(E.uploadError="Filesize over 500kb - photo was not uploaded.",E.removePhoto()):(E.uploadError=!1,E.uploadedFile=e[0]))}function p(){E.recipeData.photo=null,E.uploadedFile=null,angular.element("#recipePhoto").val("")}function f(e){var t=E.recipeData.tags.indexOf(e);t>-1?(E.recipeData.tags.splice(t,1),E.tagMap[e]=!1):(E.recipeData.tags.push(e),E.tagMap[e]=!0)}function h(e){var t=E.recipeData[e],n="ingredients"===e?"ingredient":"step";angular.forEach(t,function(e,i){(!!e[n]==!1&&!e.isHeading||e.isHeading&&!!e.headingText==!1)&&t.splice(i,1)})}function m(){E.saved=!1,E.uploadError=!1,E.saveBtnText=B?"Update Recipe":"Save Recipe"}function v(e){E.saved=!0,E.saveBtnText=B?"Updated!":"Saved!",!B||B&&S!==E.recipeData.slug?r($,1e3):r(m,2e3)}function $(){var e=B?E.recipeData.slug+"/edit":recipe.slug;i.path("/recipe/"+e)}function b(e){E.saveBtnText="Error saving!",E.saved="error",r(m,4e3)}function T(){B?e.updateRecipe(E.recipe._id,E.recipeData).then(v,b):e.createRecipe(E.recipeData).then(v,b)}function w(){E.uploadError=!1,E.saveBtnText=B?"Updating...":"Saving...",E.recipeData.slug=n.slugify(E.recipeData.name),h("ingredients"),h("directions"),E.uploadedFile?o.upload({url:"/api/recipe/upload",file:E.uploadedFile}).progress(A).success(R).error(x):T()}function A(e){var t=parseInt(100*e.loaded/e.total);E.uploadError=!1,E.uploadInProgress=!0,E.uploadProgress=t+"% "+e.config.file.name,console.log(E.uploadProgress)}function R(e,t,n,i){r(function(){E.uploadInProgress=!1,E.recipeData.photo=e.filename,T()})}function x(e){E.uploadInProgress=!1,E.uploadError=e.message||e,console.log("Error uploading file:",e.message||e),b()}var y,C,U,E=this,B=!!E.recipe,S=B?E.recipe.slug:null;E.recipeData=B?E.recipe:{},E.recipeData.userId=B?E.recipe.userId:E.userId,E.recipeData.photo=B?E.recipe.photo:null,E.isTouchDevice=!!Modernizr.touchevents,E.recipeData.ingredients=B?E.recipe.ingredients:[{id:t.generateId(),type:"ing"}],E.recipeData.directions=B?E.recipe.directions:[{id:t.generateId(),type:"step"}],E.recipeData.tags=B?E.recipeData.tags:[],E.timeRegex=/^[+]?([0-9]+(?:[\.][0-9]*)?|\.[0-9]+)$/,E.timeError="Please enter a number in minutes. Multiply hours by 60.",E.categories=t.categories,E.tags=t.tags,E.dietary=t.dietary,E.chars=t.insertChar,E.insertCharInput=s,E.insertChar=l,E.clearChar=g,E.uploadedFile=null,E.updateFile=d,E.removePhoto=p,E.tagMap={},E.addRemoveTag=f,E.saveRecipe=w,a()}angular.module("rBox").directive("recipeForm",e),e.$inject=["$timeout","Recipe"],t.$inject=["recipeData","Recipe","Slug","$location","$timeout","Upload"]}(),function(){"use strict";function e(){function e(e){function t(t,n){t&&(e.rll.displayedResults=t)}e.rll={},e.$watch(function(){return angular.element(".recipesList-list-item").length},t)}return{restrict:"EA",scope:{recipes:"=",openFilters:"@",customLabels:"@",categoryFilter:"@",tagFilter:"@"},templateUrl:"ng-app/core/recipes/recipesList.tpl.html",controller:t,controllerAs:"rl",bindToController:!0,link:e}}function t(e,t){function n(){o(),e.$watch("rl.query",c),e.$watch("rl.filterPredicates",u)}function i(){d.filterPredicates.cat="",d.filterPredicates.tag="",d.filterPredicates.diet=""}function r(e){f===e&&(d.reverseObj[e]=!d.reverseObj[e]),d.reverse=d.reverseObj[e],f=e}function o(){d.nResultsShowing=h}function a(){d.nResultsShowing=d.nResultsShowing+=h}function c(){d.query&&(i(),o())}function u(e,t){e&&e!==t&&o()}function s(){d.showSearchFilter=!d.showSearchFilter}function l(){i(),d.query=""}function g(e,t){var n=0;return e&&(n=n+=1),angular.forEach(t,function(e){e&&(n=n+=1)}),n}var d=this,p=e.$watch("rl.recipes",function(e,t){e&&(angular.forEach(d.recipes,function(e){e.totalTime=(e.cookTime?e.cookTime:0)+(e.prepTime?e.prepTime:0),e.nIng=e.ingredients.length}),p())}),f="name",h=15,m=e.$watch("rl.openFilters",function(e,t){angular.isDefined(e)&&(d.showSearchFilter="true"===e,m())});"true"===d.categoryFilter&&(d.categories=t.categories,d.showCategoryFilter=!0),"true"===d.tagFilter&&(d.tags=t.tags,d.showTagFilter=!0),d.specialDiet=t.dietary,d.filterPredicates={},d.sortPredicate="name",d.reverseObj={name:!1,totalTime:!1,nIng:!1},d.toggleSort=r,d.loadMore=a,d.toggleSearchFilter=s,d.clearSearchFilter=l,d.activeSearchFilters=g,n()}angular.module("rBox").directive("recipesList",e),t.$inject=["$scope","Recipe"]}(),function(){"use strict";var e={SMALL:"(max-width: 767px)",LARGE:"(min-width: 768px)"};angular.module("rBox").constant("MQ",e)}(),function(){"use strict";function e(){function e(e,t){function n(){t.bind("touchend",i),t.bind("mouseup",i),e.$on("$destroy",r)}function i(){t.trigger("blur")}function r(){t.unbind("touchend",i),t.unbind("mouseup",i)}n()}return{restrict:"EA",link:e}}angular.module("rBox").directive("blurOnEnd",e)}(),function(){function e(e,t){function n(n,i,r){function o(){n.ab={},n.ab.host=t.host(),e(a,200)}function a(){var e=i.find(".ad-test");n.ab.blocked=e.height()<=0||!i.find(".ad-test:visible").length}o()}return{restrict:"EA",link:n,template:'<div class="ad-test fa-facebook fa-twitter" style="height:1px;"></div><div ng-if="ab.blocked" class="ab-message alert alert-danger"><i class="fa fa-ban"></i> <strong>AdBlock</strong> is prohibiting important functionality! Please disable ad blocking on <strong>{{ab.host}}</strong>. This site is ad-free.</div>'}}angular.module("rBox").directive("detectAdblock",e),e.$inject=["$timeout","$location"]}(),function(){function e(){return{restrict:"EA",template:'<div class="rBox-divider"><i class="fa fa-cutlery"></i></div>'}}angular.module("rBox").directive("divider",e)}(),function(){"use strict";function e(e,n){function i(t,i,r,o){function a(){n.init({scope:t,resizedFn:c,debounce:200});t.$watch("loading.active",u)}function c(){d=e.innerHeight+"px",o.active&&g.css({height:d,overflowY:"hidden"})}function u(e,t){e?s():l()}function s(){g.css({height:d,overflowY:"hidden"})}function l(){g.css({height:"auto",overflowY:"auto"})}var g=angular.element("body"),d=e.innerHeight+"px";a()}return{restrict:"EA",replace:!0,templateUrl:"ng-app/core/ui/loading.tpl.html",transclude:!0,controller:t,controllerAs:"loading",bindToController:!0,link:i}}function t(e){function t(){e.$on("loading-on",n),e.$on("loading-off",i)}function n(){r.active=!0}function i(){r.active=!1}var r=this;t()}angular.module("rBox").directive("loading",e),e.$inject=["$window","resize"],t.$inject=["$scope"]}(),function(){"use strict";function e(){return function(e,t){var n=e,i=angular.isUndefined(t)?50:t;return e.length>i&&(n=e.substr(0,i)+"..."),n}}angular.module("rBox").filter("trimStr",e)}(),function(){"use strict";function e(e){return function(t){return e.trustAsHtml(t)}}angular.module("rBox").filter("trustAsHTML",e),e.$inject=["$sce"]}(),function(){"use strict";function e(e,t,n,i,r){function o(){c(),e.$on("$locationChangeSuccess",c)}function a(){l.adminUser=void 0,n.logout("/login")}function c(){function e(e){l.user=e,l.adminUser=e.isAdmin}r.isAuthenticated()&&angular.isUndefined(l.user)&&i.getUser().then(e)}function u(e){return t.path()===e}function s(e){return t.path().substr(0,e.length)===e}var l=this;l.logout=a,l.isAuthenticated=r.isAuthenticated,l.indexIsActive=u,l.navIsActive=s,o()}angular.module("rBox").controller("HeaderCtrl",e),e.$inject=["$scope","$location","$auth","userData","Utils"]}(),function(){"use strict";function e(e,t){function n(n){function i(){t.init({scope:n,resizedFn:r,debounce:100});n.$on("$locationChangeStart",u),n.$on("enter-mobile",s),n.$on("exit-mobile",l)}function r(){p.css({minHeight:e.innerHeight+"px"})}function o(){d.removeClass("nav-closed").addClass("nav-open"),g=!0}function a(){d.removeClass("nav-open").addClass("nav-closed"),g=!1}function c(){g?a():o()}function u(){g&&a()}function s(e){a(),n.nav.toggleNav=c}function l(e){n.nav.toggleNav=null,d.removeClass("nav-closed nav-open")}var g,d=angular.element("body"),p=d.find(".layout-canvas");n.nav={},i()}return{restrict:"EA",link:n}}angular.module("rBox").directive("navControl",e),e.$inject=["$window","resize"]}(),function(){"use strict";function e(e,t,n,i,r,o,a,c,u){function s(){t.setTitle("My Account"),h(),e.$watch("account.user.displayName",m),l()}function l(){return e.$emit("loading-on"),A.getProfile()}function g(e){u.search("view",e),A.currentTab=e}function d(){return r.getUser().then(p,f)}function p(t){A.user=t,A.administrator=A.user.isAdmin,A.linkedAccounts=c.getLinkedAccounts(A.user,"account"),A.showAccount=!0,e.$emit("loading-off")}function f(e){A.errorGettingUser=!0}function h(){A.btnSaved=!1,A.btnSaveText="Save"}function m(e,t){""===e||null===e?A.btnSaveText="Enter Name":A.btnSaveText="Save"}function v(){var e={displayName:A.user.displayName};A.user.displayName&&(A.btnSaveText="Saving...",r.updateUser(e).then($,b))}function $(){A.btnSaved=!0,A.btnSaveText="Saved!",o(h,2500)}function b(){A.btnSaved="error",A.btnSaveText="Error saving!"}function T(e){i.link(e).then(A.getProfile)["catch"](function(e){alert(e.data.message)})}function w(e){i.unlink(e).then(A.getProfile)["catch"](function(t){alert(t.data?t.data.message:"Could not unlink "+e+" account")})}var A=this,R=u.search().view;A.tabs=[{name:"User Info",query:"user-info"},{name:"Manage Logins",query:"manage-logins"}],A.currentTab=R?R:"user-info",A.logins=a.LOGINS,A.isAuthenticated=n.isAuthenticated,A.changeTab=g,A.getProfile=d,A.updateProfile=v,A.link=T,A.unlink=w,s()}angular.module("rBox").controller("AccountCtrl",e),e.$inject=["$scope","Page","Utils","$auth","userData","$timeout","OAUTH","User","$location"]}(),function(){"use strict";function e(e,t,n,i,r){function o(){t.setTitle("Admin"),a()}function a(){return e.$emit("loading-on"),i.getAllUsers().then(c,u)}function c(t){s.users=t,angular.forEach(s.users,function(e){e.linkedAccounts=r.getLinkedAccounts(e)}),s.showAdmin=!0,e.$emit("loading-off")}function u(e){s.showAdmin=!1}var s=this;s.isAuthenticated=n.isAuthenticated,s.users=null,s.showAdmin=!1,o()}angular.module("rBox").controller("AdminCtrl",e),e.$inject=["$scope","Page","Utils","userData","User"]}(),function(){"use strict";function e(e,t,n,i,r,o,a){function c(){for(t.setTitle("All Recipes"),e.$on("enter-mobile",s),e.$on("exit-mobile",l),h=0;h<$.categories.length;h++)$.mapCategories[$.categories[h]]=0;for(m=0;m<$.tags.length;m++)$.mapTags[$.tags[m]]=0;u(),r.isAuthenticated()&&angular.isUndefined($.user)?o.getUser().then(f):r.isAuthenticated()||($.welcomeMsg='Welcome to <strong>rBox</strong>! Browse through the public recipe box or <a href="/login">Login</a> to file or contribute recipes.')}function u(){return e.$emit("loading-on"),n.getPublicRecipes().then(d,p)}function s(){$.viewformat="small"}function l(){$.viewformat="large"}function g(e){a.search("view",e),$.currentTab=e}function d(t){$.recipes=t,angular.forEach($.recipes,function(e){for($.mapCategories[e.category]+=1,v=0;v<e.tags.length;v++)$.mapTags[e.tags[v]]+=1}),e.$emit("loading-off")}function p(e){console.log("There was an error retrieving recipes:",e)}function f(e){$.user=e,$.welcomeMsg="Hello, "+$.user.displayName+'! Want to <a href="/my-recipes?view=new-recipe">add a new recipe</a>?'}var h,m,v,$=this,b=a.search().view;$.tabs=[{name:"Recipe Boxes",query:"recipe-boxes"},{name:"Search / Browse All",query:"search-browse-all"}],$.currentTab=b?b:"recipe-boxes",$.changeTab=g,$.categories=i.categories,$.tags=i.tags,$.mapCategories={},$.mapTags={},c()}angular.module("rBox").controller("HomeCtrl",e),e.$inject=["$scope","Page","recipeData","Recipe","Utils","userData","$location"]}(),function(){"use strict";function e(e,t,n,i,r,o){function a(){e.setTitle("Login")}function c(e){g.loggingIn=!0,n.authenticate(e).then(u)["catch"](s)}function u(e){g.loggingIn=!1,r.authPath&&o.path(r.authPath)}function s(e){console.log(e.data),g.loggingIn="error",g.loginMsg=""}function l(){n.logout("/login")}var g=this;g.logins=i.LOGINS,g.isAuthenticated=t.isAuthenticated,g.authenticate=c,g.logout=l,a()}angular.module("rBox").controller("LoginCtrl",e),e.$inject=["Page","Utils","$auth","OAUTH","$rootScope","$location"]}(),function(){"use strict";function e(e,t,n,i,r,o){function a(){e.setTitle("My Recipes"),o.$on("enter-mobile",u),o.$on("exit-mobile",s),c()}function c(){o.$emit("loading-on"),i.getUser().then(g),n.getMyRecipes().then(p,f)}function u(){h.tabs[0].name="Recipe Box",h.tabs[1].name="Filed",h.tabs[2].name="New Recipe"}function s(){h.tabs[0].name="My Recipe Box",h.tabs[1].name="Filed Recipes",h.tabs[2].name="Add New Recipe"}function l(e){r.search("view",e),h.currentTab=e}function g(e){var t={savedRecipes:e.savedRecipes};h.user=e,n.getFiledRecipes(t).then(d)}function d(e){h.filedRecipes=e}function p(e){h.recipes=e,o.$emit("loading-off")}function f(e){console.log("Error loading recipes",e),o.$emit("loading-off")}var h=this,m=r.search().view;h.tabs=[{query:"recipe-box"},{query:"filed-recipes"},{query:"new-recipe"}],h.currentTab=m?m:"recipe-box",h.changeTab=l,h.isAuthenticated=t.isAuthenticated,a()}angular.module("rBox").controller("MyRecipesCtrl",e),e.$inject=["Page","Utils","recipeData","userData","$location","$scope"]}(),function(){"use strict";function e(e,t,n,i,r,o,a,c){function u(){t.setTitle("Edit Recipe"),s(),f()}function s(){e.$emit("loading-on"),o.getUser().then(g),r.getRecipe(b).then(d,p)}function l(e){a.search("view",e),$.currentTab=e}function g(e){$.user=e}function d(n){$.recipe=n,$.originalName=$.recipe.name,t.setTitle("Edit "+$.originalName),e.$emit("loading-off")}function p(n){$.recipe="error",t.setTitle("Error"),$.errorMsg=n.data.message,e.$emit("loading-off")}function f(){$.deleted=!1,$.deleteBtnText="Delete Recipe"}function h(e){function t(){a.path("/my-recipes"),a.search("view",null)}$.deleted=!0,$.deleteBtnText="Deleted!",c(t,1500)}function m(){$.deleted="error",$.deleteBtnText="Error deleting!",c(f,2500)}function v(){$.deleteBtnText="Deleting...",r.deleteRecipe($.recipe._id).then(h,m)}var $=this,b=i.slug,T=a.search().view;$.tabs=[{name:"Edit Recipe",query:"edit"},{name:"Delete Recipe",query:"delete"}],$.currentTab=T?T:"edit",$.changeTab=l,$.isAuthenticated=n.isAuthenticated,$.deleteRecipe=v,u()}angular.module("rBox").controller("EditRecipeCtrl",e),e.$inject=["$scope","Page","Utils","$routeParams","recipeData","userData","$location","$timeout"]}(),function(){"use strict";function e(e,t,n,i,r,o){function a(){t.setTitle("Recipe"),c()}function c(){e.$emit("loading-on"),n.isAuthenticated()&&o.getUser().then(u),r.getRecipe($).then(s,g)}function u(e){v.user=e,v.fileText="File this recipe",v.unfileText="Remove from Filed Recipes"}function s(n){v.recipe=n,t.setTitle(v.recipe.name),o.getAuthor(v.recipe.userId).then(p),l(v.ingChecked,v.recipe.ingredients),l(v.stepChecked,v.recipe.directions),e.$emit("loading-off")}function l(e,t){var n;for(n=0;n<t.length;n++)e[n]=!1}function g(n){v.recipe="error",t.setTitle("Error"),v.errorMsg=n.data.message,e.$emit("loading-off")}function d(e,t){v[e+"Checked"][t]=!v[e+"Checked"][t]}function p(e){v.author=e}function f(e){return r.fileRecipe(e).then(h,m)}function h(e){console.log(e.message),v.apiMsg=e.added?"Recipe saved!":"Recipe removed!",v.filed=e.added}function m(e){console.log(e.data.message)}var v=this,$=i.slug;v.ingChecked=[],v.stepChecked=[],v.toggleCheck=d,v.fileRecipe=f,a()}angular.module("rBox").controller("RecipeCtrl",e),e.$inject=["$scope","Page","Utils","$routeParams","recipeData","userData"]}(),function(){"use strict";function e(){return function(e){function t(e){return a&&1===e?" minute":a&&1!==e?" minutes":void 0}var n=60,i=1*e,r=i/n>=1,o=i%n,a=0!==o,c=Math.floor(i/n),u=1===c?" hour":" hours",s=a?", "+o+t(o):"",l=1===i?" minute":" minutes",g=null;return g=r?c+u+s:i+l}}angular.module("rBox").filter("minToH",e)}(),function(){"use strict";function e(e,t,n,i,r){function o(){a()}function a(){e.$emit("loading-on"),i.getAuthor(l).then(c),n.getAuthorRecipes(l).then(u)}function c(e){s.author=e,s.heading="Recipes by "+s.author.displayName,s.customLabels=s.heading,t.setTitle(s.heading)}function u(t){s.recipes=t,e.$emit("loading-off")}var s=this,l=r.userId;s.className="recipesAuthor",s.showCategoryFilter="true",s.showTagFilter="true",o()}angular.module("rBox").controller("RecipesAuthorCtrl",e),e.$inject=["$scope","Page","recipeData","userData","$routeParams"]}(),function(){"use strict";function e(e,t,n,i){function r(){t.setTitle(c.heading),o()}function o(){return e.$emit("loading-on"),n.getPublicRecipes().then(a)}function a(t){var n=[];angular.forEach(t,function(e){e.category==s&&n.push(e)}),c.recipes=n,e.$emit("loading-off")}var c=this,u=i.category,s=u.substring(0,1).toLocaleUpperCase()+u.substring(1);c.className="recipesCategory",c.heading=s+"s",c.customLabels=c.heading,c.showCategoryFilter="false",c.showTagFilter="true",r()}angular.module("rBox").controller("RecipesCategoryCtrl",e),e.$inject=["$scope","Page","recipeData","$routeParams"]}(),function(){"use strict";function e(e,t,n,i){function r(){t.setTitle(c.heading),o()}function o(){return e.$emit("loading-on"),n.getPublicRecipes().then(a)}function a(t){var n=[];angular.forEach(t,function(e){e.tags.indexOf(u)>-1&&n.push(e)}),c.recipes=n,e.$emit("loading-off")}var c=this,u=i.tag;c.className="recipesTag",c.heading='Recipes tagged "'+u+'"',c.customLabels=c.heading,c.showCategoryFilter="true",c.showTagFilter="false",r()}angular.module("rBox").controller("RecipesTagCtrl",e),e.$inject=["$scope","Page","recipeData","$routeParams"]}();