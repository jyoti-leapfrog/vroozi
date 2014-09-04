service.factory('Item', function($resource) {
    return $resource('api/items/:id', {id: '@id'}, {
        query: { method:'GET', params:{}, isArray: false },
        get: { method:'GET' }
    });
});