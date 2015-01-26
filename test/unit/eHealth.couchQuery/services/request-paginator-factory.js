'use strict';

describe('Service: requestPaginatorFactory', function () {

  // load the service's module
  beforeEach(module('eHealth.couchQuery'));

  // instantiate service
  var requestPaginatorFactory,
      $q,
      $rootScope,
      context = {},
      result;
  beforeEach(inject(function (_requestPaginatorFactory_, _$q_, _$rootScope_) {
    requestPaginatorFactory = _requestPaginatorFactory_;
    $q = _$q_;
    $rootScope = _$rootScope_;
  }));

  it('can update a result', function() {
    var res = requestPaginatorFactory.updateResult({
      total_rows: 1,
      rows: [{}]
    }, 40, 20, {}, null, {});
    expect(res).toBeDefined();
  });
  it('uses the default page size', function(){
    var query = jasmine.createSpy().andReturn($q.when());
    requestPaginatorFactory(query);
    expect(query).toHaveBeenCalledWith({ limit : 20, skip : 0 });
  });
  it('can use a custom page size', function(){
    var query = jasmine.createSpy().andReturn($q.when());
    requestPaginatorFactory(query, {}, { pageSize:40 });
    expect(query).toHaveBeenCalledWith({ limit : 40, skip : 0 });
  });
  describe('with duplicate results', function(){
    beforeEach(function() {
      function query() {
        return $q.when({
          total_rows: 3,
          rows: [{
            id: 1
          }, {
            id: 1
          }, {
            id: 2
          }]
        });
      }
      requestPaginatorFactory(query, {}, {unique:true})
        .then(function(_result_) {
          result = _result_;
        });
      $rootScope.$digest();
    });
    it('eliminates duplicates', function(){
      expect(result.rows.length).toBe(2);
    });
    it('eliminates duplicates on page change', function(){
      result.next();
      $rootScope.$digest();
      expect(result.rows.length).toBe(2);
    });
  });
  describe('the result object', function() {
    beforeEach(function() {
      function query() {
        return $q.when({
          total_rows: 1,
          rows: [{ 'a': 'a'}]
        });
      }
      requestPaginatorFactory(query, {})
        .then(function(_result_) {
          result = _result_;
          context.result = _result_;
        });
      $rootScope.$digest();
    });
    paginatedResultInterface(context);
    it('can transform existing rows', function() {
      result.transform(function (row) {
        row.a = 'b';
        return row;
      })
      expect(result.rows[0].a).toBe('b');
    });
  });
});
