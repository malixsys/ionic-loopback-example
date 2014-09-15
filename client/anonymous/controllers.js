'use strict';

require('./services');

angular.module('app.controllers', ['app.services', 'ngCookies', 'lbServices'])

 .controller('AppCtrl', function($scope, $ionicModal, $timeout, AppAuth, Animal) {
    AppAuth.ensureHasCurrentUser(function(user) {
      $scope.currentUser = (user && user.email) ? user : {anonymous: true};
    });

    $scope.animals = Animal.find();

    // Form data for the login modal
    $scope.loginData = {
      email: '',
      password: ''
    };

    // Create the login modal that we will use later
    $ionicModal.fromTemplateUrl('templates/login.html', {
      scope: $scope
    }).then(function(modal) {
      $scope.modal = modal;
    });

    // Triggered in the login modal to close it
    $scope.closeLogin = function() {
      $scope.modal.hide();
    };

    $scope.logout = function() {
      AppAuth.logout();
    };

    // Open the login modal
    $scope.login = function() {
      $scope.modal.show();
    };

    $scope.loginGoogle = function() {
      window.location = '/auth/google';
    };

    $scope.doLogin = function() {
      AppAuth.login($scope.loginData, function(user) {
        console.log(user);
        $scope.currentUser = (user && user.email) ? user : {anonymous: true};
        $scope.closeLogin();
      });
    };
  });
