service.factory('Supplier', function($resource) {
    return $resource('api/suppliers/:id', {id: '@id'}, {
        query: { method:'GET', params:{}, isArray: true },
        find: { method:'GET', params:{}, isArray: false },
        get: { method:'GET' },
        save : { method : 'PUT' },
        create : { method : 'POST' },
        destroy : { method : 'DELETE' }
    });
});
