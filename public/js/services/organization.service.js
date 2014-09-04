service.factory('Organization', function($resource) {
    return $resource('api/organization/:id', {}, {
        query: {method:'GET', params:{}, isArray:true},
        create : { method : 'POST' },
        save : { method : 'PUT' },
        delete : { method : 'DELETE' }
    });
});

