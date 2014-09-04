'use strict';

service.factory('Notifications', function($resource){
    return $resource('api/notifications', {}, {
        query: {method:'GET', params:{}, isArray:true}
    });
});