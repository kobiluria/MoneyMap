var chai = require('chai')
var expect = chai.expect;
var request = require('supertest')
var url = 'localhost:3000'


describe('welcome' , function() {
    it('should say welcome to the API',
        function(done){
            request(url)
                .get('/api')
                .set('Accept', 'application/json')
                .expect(200,'{"message":"welcome to Money Map API"}')
            done();

        });
});


