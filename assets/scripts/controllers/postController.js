angular.module('hgtApp').controller('postController', ['$scope', '$http', '$timeout', 'Upload', function($scope, $http, $timeout, Upload) {
	$scope.formData = {};
	$scope.newPost = {};

	$scope.$watch('files', function (files) {
        $scope.formUpload = false;
        if (files != null) {
          if (!angular.isArray(files)) {
            $timeout(function () {
              $scope.files = files = [files];
            });
            return;
          }
          for (var i = 0; i < files.length; i++) {
            $scope.errorMsg = null;
            (function (f) {
              $scope.upload(f);
            })(files[i]);
          }
        }
    });

    $scope.createPost = function (file) {
        $scope.formUpload = true;
        if (file != null) {
          $scope.upload(file)
        }
    };

    $scope.upload = function(file) {
        $scope.errorMsg = null;
        console.log($scope.newPost);
        
        file.upload = Upload.upload({
          url: '/api/post',
          data: {info: $scope.newPost, file: file}
        });

        file.upload.then(function (response) {
          $timeout(function () {
            $scope.posts = response.data;

          });
        }, function (response) {
          if (response.status > 0)
            $scope.errorMsg = response.status + ': ' + response.data;
        }, function (evt) {
          // Math.min is to fix IE which reports 200% sometimes
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
        });

        file.upload.xhr(function (xhr) {
          // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
        });
        $scope.newPost = null;
        $scope.picFile = null;
    };

    // $scope.formUpload.$setPristine();
    //     $scope.currentRecord={};


 		// $scope. = function() {

 		// if (!$.isEmptyObject($scope.formData)) {
   //  	$scope.$watch('files', function (files) {
	  //       $scope.formUpload = false;
	  //       if (files != null) {
	  //         if (!angular.isArray(files)) {
	  //           $timeout(function () {
	  //             $scope.files = files = [files];
	  //           });
	  //           return;
	  //         }
	  //         for (var i = 0; i < files.length; i++) {
	  //           $scope.errorMsg = null;
	  //           (function (f) {
	  //             $scope.upload(f);
	  //           })(files[i]);
	  //         }
	  //       }
	  //   }); 

   //  $scope.createPost = function (file) {
   //      $scope.formUpload = true;
   //      if (file != null) {
   //        $scope.upload(file)
   //      }
   //  };


   //  newPost.create($scope.formData)
   //  $scope.upload = function(file) {
   //      $scope.errorMsg = null;
        
   //      file.upload = Upload.upload({
   //        url: '/api/post',
   //        data: {info: $scope.formData, file: file}
   //      });

   //      .success(function(data) {
   //      file.upload.then(function (response) {
   //        $timeout(function () {
   //          $scope.newPost = response.data;
   //        });
   //      }, function (response) {
   //        if (response.status > 0)
   //          $scope.errorMsg = response.status + ': ' + response.data;
   //      }, function (evt) {
   //        // Math.min is to fix IE which reports 200% sometimes
   //        file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total));
   //      });
  
   //                          if (data.status == "error") {
   //                              window.location = '/';
   //                          }
   //                          else {   
   //                              $scope.formData = {}; // clear the form so our user is ready to enter another
   //                              $scope.newPost = data; // assign our new list of todos
   //                          }
   //                      });
   //          }

   //          file.upload.xhr(function (xhr) {
   //        // xhr.upload.addEventListener('abort', function(){console.log('abort complete')}, false);
   //      });
 		// 	// console.log($scope.newPost);
 		// 	// $http.post('/api/post', $scope.newPost).success(function(response){
 		// 	// 	$scope.newPost = {};
 		// 	// 	console.log(response);
 		// 	// }).error(function(error) {
 		// 	// 	console.log(error);
 		// 	// })
 		// };
 }]);