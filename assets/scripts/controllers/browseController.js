'use strict';

angular.module('hgtApp').controller('browseController', function($scope, $http) {
 $scope.posts = [];
 $scope.searchPost = '';
 $scope.loadPosts =  function (){
 	$http.get ('/api/post').then(function(result){
 		console.log ('finished');
 		$scope.posts = result.data;
 		// console.log (JSON.stringify (result.data));
 		// console.log ($scope.posts);
 	})
 };


 });